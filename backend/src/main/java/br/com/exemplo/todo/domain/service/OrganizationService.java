package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.auth.MembershipOutput;
import br.com.exemplo.todo.api.dto.auth.OrganizationOutput;
import br.com.exemplo.todo.api.dto.organization.OrganizationInput;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.exception.OrganizationAccessDeniedException;
import br.com.exemplo.todo.domain.exception.OrganizationNotFoundException;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
import br.com.exemplo.todo.domain.repository.UserRepository;
import br.com.exemplo.todo.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public MembershipOutput criarOrganizacao(OrganizationInput input) {
        AuthenticatedUser authenticatedUser = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = authenticatedUser.getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Cria organizacao
        Organization organization = new Organization();
        organization.setNome(input.nome());
        organization.setSlug(generateSlug(input.nome()));
        organization.setAtiva(true);
        organization.setDataCriacao(LocalDateTime.now());
        organization.setDataAtualizacao(LocalDateTime.now());
        organization = organizationRepository.save(organization);

        // Cria membership como OWNER
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(organization);
        membership.setPapel(MembershipRole.OWNER);
        membership.setAtivo(true);
        membership.setDataIngresso(LocalDateTime.now());
        membership = membershipRepository.save(membership);

        log.info("Nova organizacao criada: orgId={}, nome={}, userId={}",
                organization.getId(), organization.getNome(), userId);

        return MembershipOutput.from(membership);
    }

    @Transactional
    public OrganizationOutput atualizarOrganizacao(Long organizationId, OrganizationInput input) {
        AuthenticatedUser authenticatedUser = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = authenticatedUser.getUserId();

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(organizationId));

        // Verifica se usuario tem permissao (OWNER ou ADMIN)
        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, organizationId)
                .orElseThrow(() -> new OrganizationAccessDeniedException(organizationId));

        if (membership.getPapel() != MembershipRole.OWNER && membership.getPapel() != MembershipRole.ADMIN) {
            throw new OrganizationAccessDeniedException("Apenas OWNER ou ADMIN podem alterar a organizacao");
        }

        organization.setNome(input.nome());
        organization.setDataAtualizacao(LocalDateTime.now());
        organization = organizationRepository.save(organization);

        log.info("Organizacao atualizada: orgId={}, nome={}, userId={}",
                organization.getId(), organization.getNome(), userId);

        return OrganizationOutput.from(organization);
    }

    private String generateSlug(String name) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "org";
        }

        // Adiciona sufixo se ja existir
        String slug = baseSlug;
        int counter = 1;
        while (organizationRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}
