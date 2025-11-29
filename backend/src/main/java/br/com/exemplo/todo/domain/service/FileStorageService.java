package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

public interface FileStorageService {

    StoredFile store(MultipartFile file, MediaOwnerType ownerType, Long ownerId);

    StoredFile getMetadata(UUID id);

    FileContent getContent(UUID id);

    void delete(UUID id);

    record FileContent(StoredFile metadata, InputStream stream) { }
}
