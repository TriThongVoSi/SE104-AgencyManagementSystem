package org.example.AgentManagementBE.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

public class SHA256PasswordEncoder implements PasswordEncoder {
    
    private static final Logger logger = LoggerFactory.getLogger(SHA256PasswordEncoder.class);
    
    @Override
    public String encode(CharSequence rawPassword) {
        if (rawPassword == null) {
            return null;
        }
        return hashSHA256(rawPassword.toString());
    }
    
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        String hashedPassword = hashSHA256(rawPassword.toString());
        
        // Debug logging
        logger.debug("Raw password: {}", rawPassword);
        logger.debug("Computed hash: {}", hashedPassword);
        logger.debug("Stored hash: {}", encodedPassword);
        
        // Try exact match first
        boolean exactMatch = hashedPassword.equals(encodedPassword);
        if (exactMatch) {
            logger.debug("Exact match found");
            return true;
        }
        
        // Try case-insensitive match
        boolean caseInsensitiveMatch = hashedPassword.equalsIgnoreCase(encodedPassword);
        if (caseInsensitiveMatch) {
            logger.debug("Case-insensitive match found");
            return true;
        }
        
        logger.debug("No match found");
        return false;
    }
    
    /**
     * Hash a string using SHA-256 algorithm
     * @param input the string to hash
     * @return the hex string representation of the hash (lowercase)
     */
    public static String hashSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            // Convert byte array to hex string (lowercase)
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Verify if a plain text password matches a SHA-256 hash
     * @param plainPassword the plain text password
     * @param hashedPassword the SHA-256 hash to compare against
     * @return true if they match, false otherwise
     */
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        String computedHash = hashSHA256(plainPassword);
        
        // Debug logging
        logger.debug("Plain password: {}", plainPassword);
        logger.debug("Computed hash: {}", computedHash);
        logger.debug("Stored hash: {}", hashedPassword);
        
        // Try exact match first
        boolean exactMatch = computedHash.equals(hashedPassword);
        if (exactMatch) {
            logger.debug("Exact match found");
            return true;
        }
        
        // Try case-insensitive match
        boolean caseInsensitiveMatch = computedHash.equalsIgnoreCase(hashedPassword);
        if (caseInsensitiveMatch) {
            logger.debug("Case-insensitive match found");
            return true;
        }
        
        logger.debug("No match found");
        return false;
    }
} 