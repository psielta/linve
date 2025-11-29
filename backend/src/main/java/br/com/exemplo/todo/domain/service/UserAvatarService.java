package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.exception.CannotModifyOwnerException;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.UserRepository;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAvatarService {

    private static final String MEDIA_PREFIX = "/api/media/";

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public User atualizarAvatar(Long userId, MultipartFile file) {
        Long orgId = TenantContext.getOrganizationId();
        Long requesterId = TenantContext.getUserId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        validarPermissao(requesterId, userId, membership);
        validarArquivoImagem(file);

        User user = membership.getUser();
        tentarApagarAvatarAnterior(user);

        var stored = fileStorageService.store(file, MediaOwnerType.USER, userId);
        user.setAvatar(MEDIA_PREFIX + stored.getId());
        user.setDataAtualizacao(java.time.LocalDateTime.now());
        userRepository.save(user);

        log.info("Avatar atualizado: userId={}, orgId={}, requester={}", userId, orgId, requesterId);
        return user;
    }

    @Transactional
    public void removerAvatar(Long userId) {
        Long orgId = TenantContext.getOrganizationId();
        Long requesterId = TenantContext.getUserId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        validarPermissao(requesterId, userId, membership);

        User user = membership.getUser();
        tentarApagarAvatarAnterior(user);
        user.setAvatar(null);
        user.setDataAtualizacao(java.time.LocalDateTime.now());
        userRepository.save(user);

        log.info("Avatar removido: userId={}, orgId={}, requester={}", userId, orgId, requesterId);
    }

    private void validarPermissao(Long requesterId, Long targetUserId, Membership membership) {
        boolean sameUser = requesterId.equals(targetUserId);
        boolean adminOuOwner = TenantContext.isAdmin() || TenantContext.isOwner();

        if (!sameUser && !adminOuOwner) {
            throw new CannotModifyOwnerException("Apenas o proprio usuario ou ADMIN/OWNER podem alterar avatar");
        }

        // Nao permitir alterar avatar do OWNER por outro admin que nao seja OWNER
        if (!sameUser && membership.getPapel() == MembershipRole.OWNER && !TenantContext.isOwner()) {
            throw new CannotModifyOwnerException("Apenas OWNER pode alterar avatar do proprietario");
        }
    }

    private void validarArquivoImagem(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo obrigatorio");
        }
        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!(contentType.equalsIgnoreCase("image/png")
                || contentType.equalsIgnoreCase("image/jpeg")
                || contentType.equalsIgnoreCase("image/webp"))) {
            throw new IllegalArgumentException("Tipo de arquivo nao suportado. Use PNG, JPEG ou WEBP.");
        }
    }

    private void tentarApagarAvatarAnterior(User user) {
        if (user.getAvatar() == null) {
            return;
        }
        extrairIdDeUrl(user.getAvatar()).ifPresent(id -> {
            try {
                fileStorageService.delete(id);
            } catch (Exception e) {
                log.warn("Nao foi possivel remover avatar anterior id={}: {}", id, e.getMessage());
            }
        });
    }

    private Optional<UUID> extrairIdDeUrl(String url) {
        if (url == null || !url.startsWith(MEDIA_PREFIX)) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(url.substring(MEDIA_PREFIX.length())));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
