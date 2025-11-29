package br.com.exemplo.todo.domain.model.entity;

import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "STORED_FILE")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StoredFile {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "FILE_ID", length = 36)
    private UUID id;

    @Column(name = "ORG_ID", nullable = false)
    private Long organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "OWNER_TYPE", nullable = false, length = 30)
    private MediaOwnerType ownerType;

    @Column(name = "OWNER_ID")
    private Long ownerId;

    @Column(name = "FILE_NAME", nullable = false, length = 255)
    private String filename;

    @Column(name = "CONTENT_TYPE", length = 150)
    private String contentType;

    @Column(name = "FILE_SIZE")
    private Long size;

    @Column(name = "STORAGE_KEY", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
