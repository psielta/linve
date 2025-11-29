package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.exception.OrganizationAccessDeniedException;
import br.com.exemplo.todo.domain.exception.OrganizationNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
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
public class OrganizationLogoService {

    private static final String MEDIA_PREFIX = "/api/media/";

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public Organization atualizarLogo(Long organizationId, MultipartFile file) {
        Long userId = TenantContext.getUserId();

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(organizationId));

        // Valida se o usuário é OWNER ou ADMIN na organização alvo (não precisa ser a atual)
        validarPermissaoOwnerOuAdmin(userId, organizationId);
        validarArquivoImagem(file);

        // Remove logo anterior se existir
        tentarApagarLogoAnterior(organization);

        var storedFile = fileStorageService.store(file, MediaOwnerType.ORGANIZATION, organizationId);
        organization.setLogo(MEDIA_PREFIX + storedFile.getId());
        organization.setDataAtualizacao(java.time.LocalDateTime.now());

        organizationRepository.save(organization);

        log.info("Logo atualizada: orgId={}, userId={}", organizationId, userId);
        return organization;
    }

    @Transactional
    public void removerLogo(Long organizationId) {
        Long userId = TenantContext.getUserId();

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(organizationId));

        // Valida se o usuário é OWNER ou ADMIN na organização alvo (não precisa ser a atual)
        validarPermissaoOwnerOuAdmin(userId, organizationId);

        tentarApagarLogoAnterior(organization);
        organization.setLogo(null);
        organization.setDataAtualizacao(java.time.LocalDateTime.now());
        organizationRepository.save(organization);

        log.info("Logo removida: orgId={}, userId={}", organizationId, userId);
    }

    private void validarPermissaoOwnerOuAdmin(Long userId, Long orgId) {
        membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .filter(m -> m.getPapel() == br.com.exemplo.todo.domain.model.enums.MembershipRole.ADMIN
                        || m.getPapel() == br.com.exemplo.todo.domain.model.enums.MembershipRole.OWNER)
                .orElseThrow(() -> new OrganizationAccessDeniedException("Apenas OWNER ou ADMIN podem alterar o logo"));
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

    private void tentarApagarLogoAnterior(Organization organization) {
        if (organization.getLogo() == null) {
            return;
        }
        extrairIdDeUrl(organization.getLogo()).ifPresent(id -> {
            try {
                fileStorageService.delete(id);
            } catch (Exception e) {
                log.warn("Nao foi possivel remover logo anterior id={}: {}", id, e.getMessage());
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
