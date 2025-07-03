package org.example.AgentManagementBE.Config;

import org.example.AgentManagementBE.Service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private PersonService personService;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find by email first, then by username
        var person = personService.findByEmail(username);
        if (person == null) {
            person = personService.findByUsername(username);
        }
        
        if (person == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        
        // Get user roles
        var roles = personService.getUserRoles(person.getPersonId());
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        
        return User.builder()
                .username(person.getPersonEmail()) // Use email as username for Spring Security
                .password(person.getPasswordHash())
                .authorities(authorities)
                .disabled(!person.getIsActive())
                .build();
    }
} 