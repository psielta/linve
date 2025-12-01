package br.com.exemplo.todo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "storage.s3")
public class StorageProperties {
    /**
     * Regiao AWS, ex.: us-east-1
     */
    private String region = "us-east-1";

    /**
     * Nome do bucket S3 para armazenar objetos.
     */
    private String bucket;
}
