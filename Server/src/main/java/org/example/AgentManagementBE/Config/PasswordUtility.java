package org.example.AgentManagementBE.Config;

/**
 * Utility class for password operations
 * This class provides methods to generate SHA-256 hashes for seeding data
 */
public class PasswordUtility {
    
    /**
     * Generate SHA-256 hash for a password
     * Use this method to create password hashes for database seeding
     * 
     * @param password the plain text password
     * @return the SHA-256 hash as hex string
     */
    public static String hashPassword(String password) {
        return SHA256PasswordEncoder.hashSHA256(password);
    }
    
    /**
     * Verify if a plain text password matches a SHA-256 hash
     * 
     * @param plainPassword the plain text password
     * @param hashedPassword the SHA-256 hash to compare against
     * @return true if they match, false otherwise
     */
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return SHA256PasswordEncoder.verifyPassword(plainPassword, hashedPassword);
    }
    
    /**
     * Main method to generate password hashes for seeding data
     * Run this to get the hash values for your SQL scripts
     */
    public static void main(String[] args) {
        String password = "123456";
        String hash = hashPassword(password);
        
        System.out.println("Password: " + password);
        System.out.println("SHA-256 Hash: " + hash);
        System.out.println("Hash length: " + hash.length() + " characters");
        
        // Verify the hash
        boolean isValid = verifyPassword(password, hash);
        System.out.println("Verification result: " + isValid);
        
        // Generate hashes for common passwords
        System.out.println("\nCommon password hashes:");
        System.out.println("'123456' -> " + hashPassword("123456"));
        System.out.println("'password' -> " + hashPassword("password"));
        System.out.println("'admin' -> " + hashPassword("admin"));
    }
} 