package br.com.exemplo.todo.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableConfigurationProperties(StorageProperties.class)
@ConditionalOnProperty(name = "storage.minio.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties properties;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }

    /**
     * Garante que o bucket padrao existe no startup.
     */
    @Bean
    public InitializingBean ensureBucketExists(MinioClient minioClient) {
        return () -> {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(properties.getBucket()).build());

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(properties.getBucket()).build());
                log.info("Bucket '{}' criado no MinIO.", properties.getBucket());
            } else {
                log.info("Bucket '{}' ja existe no MinIO.", properties.getBucket());
            }
        };
    }
}
