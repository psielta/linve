package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.config.StorageProperties;
import br.com.exemplo.todo.domain.exception.StoredFileNotFoundException;
import br.com.exemplo.todo.domain.exception.StorageException;
import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.repository.StoredFileRepository;
import br.com.exemplo.todo.security.TenantContext;
import br.com.exemplo.todo.security.TenantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.s3.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class AwsS3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final StorageProperties properties;
    private final StoredFileRepository storedFileRepository;

    @Override
    public StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId) {
        TenantInfo tenant = TenantContext.require();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio ou ausente.");
        }

        String originalFilename = Optional.ofNullable(file.getOriginalFilename()).orElse("arquivo");
        String safeFilename = sanitizeFilename(originalFilename);
        String storageKey = buildStorageKey(tenant.organizationId(), ownerType, ownerId, safeFilename);

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(properties.getBucket())
                    .key(storageKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (Exception e) {
            throw new StorageException("Erro ao salvar arquivo no S3", e);
        }

        StoredFile storedFile = new StoredFile();
        storedFile.setOrganizationId(tenant.organizationId());
        storedFile.setOwnerType(ownerType);
        storedFile.setOwnerId(ownerId);
        storedFile.setFilename(safeFilename);
        storedFile.setContentType(file.getContentType());
        storedFile.setSize(file.getSize());
        storedFile.setStorageKey(storageKey);
        storedFile.setCreatedBy(tenant.userId());

        StoredFile saved = storedFileRepository.save(storedFile);
        log.debug("Arquivo salvo no S3: org={}, key={}, id={}", tenant.organizationId(), storageKey, saved.getId());
        return saved;
    }

    @Override
    public StoredFile getMetadata(UUID id) {
        if (TenantContext.isSet()) {
            Long orgId = TenantContext.getOrganizationId();
            return storedFileRepository.findByIdAndOrganizationId(id, orgId)
                    .orElseThrow(() -> new StoredFileNotFoundException(id));
        }
        return storedFileRepository.findById(id)
                .orElseThrow(() -> new StoredFileNotFoundException(id));
    }

    @Override
    public FileContent getContent(UUID id) {
        StoredFile metadata = getMetadata(id);
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(properties.getBucket())
                    .key(metadata.getStorageKey())
                    .build();

            InputStream stream = s3Client.getObject(getRequest);
            return new FileContent(metadata, stream);
        } catch (Exception e) {
            throw new StorageException("Erro ao ler arquivo do S3", e);
        }
    }

    @Override
    public void delete(UUID id) {
        StoredFile metadata = getMetadata(id);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(properties.getBucket())
                    .key(metadata.getStorageKey())
                    .build();

            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            throw new StorageException("Erro ao remover arquivo do S3", e);
        }

        storedFileRepository.delete(metadata);
        log.debug("Arquivo removido do S3: org={}, id={}", metadata.getOrganizationId(), metadata.getId());
    }

    private String buildStorageKey(Long orgId, MediaOwnerType ownerType, Long ownerId, String filename) {
        String ownerSegment = ownerId != null ? ownerId.toString() : "generic";
        String random = UUID.randomUUID().toString();
        return orgId + "/" + ownerType.name().toLowerCase() + "/" + ownerSegment + "/" + random + "-" + filename;
    }

    private String sanitizeFilename(String originalFilename) {
        String cleaned = originalFilename.replaceAll("[\\\\/]", "_");
        return cleaned.strip();
    }
}
