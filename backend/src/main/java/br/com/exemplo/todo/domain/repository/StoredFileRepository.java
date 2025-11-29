package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StoredFileRepository extends JpaRepository<StoredFile, UUID> {

    Optional<StoredFile> findByIdAndOrganizationId(UUID id, Long organizationId);
}
