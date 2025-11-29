package br.com.exemplo.todo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "auth.magic-link")
@Getter
@Setter
public class AuthProperties {

    /**
     * URL base usada no magic link (frontend).
     * Ex.: http://localhost:4200/auth/magic-link
     */
    private String baseUrl = "http://localhost:4200/auth/magic-link";
}
