package br.com.exemplo.todo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "storage.minio")
public class StorageProperties {
    /**
     * Endpoint completo, ex.: http://localhost:9000
     */
    private String endpoint;

    private String accessKey;

    private String secretKey;

    /**
     * Nome do bucket padrao para armazenar objetos.
     */
    private String bucket;

    /**
     * Se true, utiliza HTTPS. Mantido para compatibilidade futura
     * (o endpoint ja carrega o schema).
     */
    private boolean secure = false;
}
