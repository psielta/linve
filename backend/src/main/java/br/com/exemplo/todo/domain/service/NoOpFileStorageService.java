package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.UUID;

/**
 * Implementacao no-op do FileStorageService.
 * Usada quando o armazenamento S3 esta desabilitado (ex: testes).
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "storage.s3.enabled", havingValue = "false")
public class NoOpFileStorageService implements FileStorageService {

    @Override
    public StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId) {
        log.warn("NoOpFileStorageService: store() chamado, mas armazenamento esta desabilitado.");
        throw new UnsupportedOperationException("Armazenamento de arquivos desabilitado.");
    }

    @Override
    public StoredFile getMetadata(UUID id) {
        log.warn("NoOpFileStorageService: getMetadata() chamado, mas armazenamento esta desabilitado.");
        throw new UnsupportedOperationException("Armazenamento de arquivos desabilitado.");
    }

    @Override
    public FileContent getContent(UUID id) {
        log.warn("NoOpFileStorageService: getContent() chamado, mas armazenamento esta desabilitado.");
        throw new UnsupportedOperationException("Armazenamento de arquivos desabilitado.");
    }

    @Override
    public void delete(UUID id) {
        log.warn("NoOpFileStorageService: delete() chamado, mas armazenamento esta desabilitado.");
        throw new UnsupportedOperationException("Armazenamento de arquivos desabilitado.");
    }
}
