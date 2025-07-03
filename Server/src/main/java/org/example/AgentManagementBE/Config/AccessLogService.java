package org.example.AgentManagementBE.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AccessLogService {
    
    private static final Logger accessLogger = LoggerFactory.getLogger("ACCESS_LOG");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public void logAccess(String username, String method, String uri, String userAgent, String ipAddress) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] USER=%s METHOD=%s URI=%s USER_AGENT=%s IP=%s", 
            timestamp, username, method, uri, userAgent, ipAddress);
        accessLogger.info(logMessage);
    }
    
    public void logLogin(String username, String ipAddress, boolean success) {
        String timestamp = LocalDateTime.now().format(formatter);
        String status = success ? "SUCCESS" : "FAILED";
        String logMessage = String.format("[%s] LOGIN %s USER=%s IP=%s", 
            timestamp, status, username, ipAddress);
        accessLogger.info(logMessage);
    }
    
    public void logLogout(String username, String ipAddress) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] LOGOUT USER=%s IP=%s", 
            timestamp, username, ipAddress);
        accessLogger.info(logMessage);
    }
    
    public void logTokenRefresh(String username, String ipAddress, boolean success) {
        String timestamp = LocalDateTime.now().format(formatter);
        String status = success ? "SUCCESS" : "FAILED";
        String logMessage = String.format("[%s] TOKEN_REFRESH %s USER=%s IP=%s", 
            timestamp, status, username, ipAddress);
        accessLogger.info(logMessage);
    }
} 