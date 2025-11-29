package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.media.MediaOutput;
import br.com.exemplo.todo.api.openapi.MediaControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/media", produces = MediaType.APPLICATION_JSON_VALUE)
public class MediaController implements MediaControllerOpenApi {

    private final FileStorageService fileStorageService;

    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public MediaOutput upload(@RequestParam MediaOwnerType ownerType,
                              @RequestParam(required = false) Long ownerId,
                              @RequestPart("file") MultipartFile file) {

        log.debug("Upload de media: ownerType={}, ownerId={}, filename={}", ownerType, ownerId,
                file != null ? file.getOriginalFilename() : "null");

        StoredFile storedFile = fileStorageService.store(file, ownerType, ownerId);
        return toOutput(storedFile);
    }

    @Override
    @GetMapping(value = "/{id}", produces = MediaType.ALL_VALUE)
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        FileStorageService.FileContent content = fileStorageService.getContent(id);
        StoredFile metadata = content.metadata();

        InputStreamResource resource = new InputStreamResource(content.stream());

        String contentType = metadata.getContentType() != null
                ? metadata.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        String encodedFilename = encodeFilename(metadata.getFilename());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedFilename)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, immutable")
                .body(resource);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        fileStorageService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private MediaOutput toOutput(StoredFile storedFile) {
        String url = "/api/media/" + storedFile.getId();
        return new MediaOutput(
                storedFile.getId(),
                storedFile.getFilename(),
                storedFile.getContentType(),
                storedFile.getSize(),
                storedFile.getOwnerType().name(),
                storedFile.getOwnerId(),
                url,
                storedFile.getCreatedAt()
        );
    }

    private String encodeFilename(String filename) {
        return URLEncoder.encode(filename, StandardCharsets.UTF_8);
    }
}
