package org.example.AgentManagementBE.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.example.AgentManagementBE.Config.JwtTokenProvider;
import org.example.AgentManagementBE.Config.AccessLogService;
import org.example.AgentManagementBE.Config.SHA256PasswordEncoder;
import org.example.AgentManagementBE.DTO.request.LoginRequest;
import org.example.AgentManagementBE.DTO.request.RefreshTokenRequest;
import org.example.AgentManagementBE.DTO.response.JwtResponse;
import org.example.AgentManagementBE.Service.PersonService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private PersonService personService;
    
    @Autowired
    private AccessLogService accessLogService;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, 
                                            HttpServletRequest request) {
        try {
            // Không hash password ở đây, để Spring Security tự xử lý với SHA256PasswordEncoder
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getPersonEmail(), loginRequest.getPasswordHash())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails.getUsername());
            
            // Get user info
            var person = personService.findByEmail(userDetails.getUsername());
            List<String> roles = personService.getUserRoles(person.getPersonId());
            
            JwtResponse response = new JwtResponse(
                jwt, 
                refreshToken, 
                person.getPersonId(),
                person.getPersonName(),
                person.getFullName(),
                person.getPersonEmail(),
                roles
            );
            
            // Log successful login
            String ipAddress = getClientIpAddress(request);
            accessLogService.logLogin(userDetails.getUsername(), ipAddress, true);
            
            logger.info("User '{}' logged in successfully", userDetails.getUsername());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log failed login
            String ipAddress = getClientIpAddress(request);
            accessLogService.logLogin(loginRequest.getPersonEmail(), ipAddress, false);
            
            logger.error("Login failed for user '{}': {}", loginRequest.getPersonEmail(), e.getMessage());
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest,
                                        HttpServletRequest request) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            
            if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest().body("Invalid refresh token");
            }
            
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                return ResponseEntity.badRequest().body("Refresh token is expired or invalid");
            }
            
            String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
            var person = personService.findByEmail(username);
            
            if (person == null || !person.getIsActive()) {
                return ResponseEntity.badRequest().body("User not found or inactive");
            }
            
            // Generate new access token
            List<String> roles = personService.getUserRoles(person.getPersonId());
            String newAccessToken = jwtTokenProvider.generateToken(person.getPersonEmail(), roles);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);
            
            JwtResponse response = new JwtResponse(
                newAccessToken,
                newRefreshToken,
                person.getPersonId(),
                person.getPersonName(),
                person.getFullName(),
                person.getPersonEmail(),
                roles
            );
            
            // Log successful token refresh
            String ipAddress = getClientIpAddress(request);
            accessLogService.logTokenRefresh(username, ipAddress, true);
            
            logger.info("Token refreshed for user '{}'", username);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log failed token refresh
            String ipAddress = getClientIpAddress(request);
            accessLogService.logTokenRefresh("unknown", ipAddress, false);
            
            logger.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Token refresh failed");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token from storage
        // You could implement a blacklist for tokens if needed
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            String ipAddress = getClientIpAddress(request);
            accessLogService.logLogout(username, ipAddress);
            logger.info("User '{}' logged out", username);
        }
        return ResponseEntity.ok().body("Logged out successfully");
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            var person = personService.findByEmail(email);
            if (person == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<String> roles = personService.getUserRoles(person.getPersonId());
            
            return ResponseEntity.ok(new JwtResponse(
                null, null, person.getPersonId(), person.getPersonName(),
                person.getFullName(), person.getPersonEmail(), roles
            ));
            
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error getting user info");
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 