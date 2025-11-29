package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.config.StorageProperties;
import br.com.exemplo.todo.domain.exception.StoredFileNotFoundException;
import br.com.exemplo.todo.domain.exception.StorageException;
import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.repository.StoredFileRepository;
import br.com.exemplo.todo.security.TenantContext;
import br.com.exemplo.todo.security.TenantInfo;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.minio.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class MinioFileStorageService implements FileStorageService {

    private final MinioClient minioClient;
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
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(storageKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (Exception e) {
            throw new StorageException("Erro ao salvar arquivo no armazenamento", e);
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
        log.debug("Arquivo salvo no MinIO: org={}, key={}, id={}", tenant.organizationId(), storageKey, saved.getId());
        return saved;
    }

    @Override
    public StoredFile getMetadata(UUID id) {
        // Se TenantContext estiver disponível, valida organização
        if (TenantContext.isSet()) {
            Long orgId = TenantContext.getOrganizationId();
            return storedFileRepository.findByIdAndOrganizationId(id, orgId)
                    .orElseThrow(() -> new StoredFileNotFoundException(id));
        }
        // Sem TenantContext (endpoint público), busca apenas pelo ID
        return storedFileRepository.findById(id)
                .orElseThrow(() -> new StoredFileNotFoundException(id));
    }

    @Override
    public FileContent getContent(UUID id) {
        StoredFile metadata = getMetadata(id);
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(metadata.getStorageKey())
                            .build()
            );
            return new FileContent(metadata, stream);
        } catch (Exception e) {
            throw new StorageException("Erro ao ler arquivo do armazenamento", e);
        }
    }

    @Override
    public void delete(UUID id) {
        StoredFile metadata = getMetadata(id);

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(metadata.getStorageKey())
                            .build()
            );
        } catch (Exception e) {
            throw new StorageException("Erro ao remover arquivo do armazenamento", e);
        }

        storedFileRepository.delete(metadata);
        log.debug("Arquivo removido: org={}, id={}", metadata.getOrganizationId(), metadata.getId());
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
