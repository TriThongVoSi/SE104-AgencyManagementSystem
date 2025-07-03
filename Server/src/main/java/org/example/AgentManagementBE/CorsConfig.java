package org.example.AgentManagementBE;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép tất cả các endpoint
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:5174", 
                    "http://localhost:5175",
                    "http://localhost:8080",
                    "https://*.onrender.com",
                    "https://*.vercel.app",
                    "https://*.netlify.app"
                ) // Các domain được phép
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                .allowedHeaders("*") // Cho phép tất cả header
                .allowCredentials(true) // Cho phép credentials
                .maxAge(3600); // Cache preflight response
    }
}