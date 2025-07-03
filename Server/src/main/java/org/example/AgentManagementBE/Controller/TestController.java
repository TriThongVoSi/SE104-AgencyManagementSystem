package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Config.SHA256PasswordEncoder;
import org.example.AgentManagementBE.Service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TestController {
    
    @Autowired
    private PersonService personService;
    
    @GetMapping("/hash")
    public Map<String, Object> testHash(@RequestParam String password) {
        Map<String, Object> result = new HashMap<>();
        
        // Generate hash
        String hash = SHA256PasswordEncoder.hashSHA256(password);
        
        // Get user from database
        var person = personService.findByEmail("vosithongtri@gmail.com");
        
        result.put("password", password);
        result.put("computedHash", hash);
        result.put("computedHashLength", hash.length());
        result.put("computedHashUpper", hash.toUpperCase());
        result.put("computedHashLower", hash.toLowerCase());
        
        if (person != null) {
            result.put("storedHash", person.getPasswordHash());
            result.put("storedHashLength", person.getPasswordHash().length());
            result.put("exactMatch", hash.equals(person.getPasswordHash()));
            result.put("caseInsensitiveMatch", hash.equalsIgnoreCase(person.getPasswordHash()));
        } else {
            result.put("error", "User not found");
        }
        
        return result;
    }
    
    @GetMapping("/verify")
    public Map<String, Object> testVerify(@RequestParam String password, @RequestParam String hash) {
        Map<String, Object> result = new HashMap<>();
        
        boolean isValid = SHA256PasswordEncoder.verifyPassword(password, hash);
        
        result.put("password", password);
        result.put("hash", hash);
        result.put("isValid", isValid);
        result.put("computedHash", SHA256PasswordEncoder.hashSHA256(password));
        
        return result;
    }
} 