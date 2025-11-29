package br.com.exemplo.todo.api.dto.media;

import java.time.LocalDateTime;
import java.util.UUID;

public record MediaOutput(
        UUID id,
        String filename,
        String contentType,
        Long size,
        String ownerType,
        Long ownerId,
        String url,
        LocalDateTime createdAt
) {
}
