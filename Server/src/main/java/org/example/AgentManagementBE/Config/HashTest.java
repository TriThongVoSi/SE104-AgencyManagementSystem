package org.example.AgentManagementBE.Config;

/**
 * Test class to compare MySQL SHA2 and Java MessageDigest SHA-256
 */
public class HashTest {
    
    public static void main(String[] args) {
        String password = "123456";
        
        // Java SHA-256
        String javaHash = SHA256PasswordEncoder.hashSHA256(password);
        
        System.out.println("Password: " + password);
        System.out.println("Java SHA-256: " + javaHash);
        System.out.println("Java Hash length: " + javaHash.length());
        
        // MySQL SHA2('123456', 256) result (from database)
        String mysqlHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
        System.out.println("MySQL SHA2: " + mysqlHash);
        System.out.println("MySQL Hash length: " + mysqlHash.length());
        
        // Compare
        System.out.println("Hashes match: " + javaHash.equals(mysqlHash));
        
        // Test with uppercase
        String javaHashUpper = javaHash.toUpperCase();
        System.out.println("Java Hash (uppercase): " + javaHashUpper);
        System.out.println("Hashes match (uppercase): " + javaHashUpper.equals(mysqlHash));
        
        // Test with lowercase
        String mysqlHashLower = mysqlHash.toLowerCase();
        System.out.println("MySQL Hash (lowercase): " + mysqlHashLower);
        System.out.println("Hashes match (lowercase): " + javaHash.equals(mysqlHashLower));
    }
} 