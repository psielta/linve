package br.com.exemplo.todo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Slf4j
@Configuration
@EnableConfigurationProperties(StorageProperties.class)
@ConditionalOnProperty(name = "storage.s3.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties properties;

    @Bean
    public S3Client s3Client() {
        log.info("Configurando S3Client para regiao '{}', bucket '{}'",
                properties.getRegion(), properties.getBucket());

        return S3Client.builder()
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(buildCredentialsProvider())
                .build();
    }

    private AwsCredentialsProvider buildCredentialsProvider() {
        if (StringUtils.hasText(properties.getAccessKey()) && StringUtils.hasText(properties.getSecretKey())) {
            log.info("Usando credenciais estaticas do application.yml");
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey())
            );
        }
        log.info("Usando DefaultCredentialsProvider (variaveis de ambiente ou AWS profile)");
        return DefaultCredentialsProvider.create();
    }
}
