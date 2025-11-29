package br.com.exemplo.todo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "mailgun")
@Getter
@Setter
public class MailgunProperties {

    /**
     * Dominio configurado no Mailgun (ex.: mg.seu-dominio.com).
     */
    private String domain;

    /**
     * API key privada do Mailgun.
     */
    private String apiKey;

    /**
     * Remetente padrao (ex.: "App <no-reply@seu-dominio.com>").
     */
    private String from;
}
