package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.admin.*;
import br.com.exemplo.todo.domain.exception.*;
import br.com.exemplo.todo.domain.model.entity.*;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.*;
import br.com.exemplo.todo.domain.repository.spec.MembershipSpecifications;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service para administracao de usuarios da organizacao.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final MembershipRepository membershipRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CARACTERES_SENHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    private static final int TAMANHO_SENHA = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Lista usuarios da organizacao atual com filtros e paginacao.
     */
    @Transactional(readOnly = true)
    public Page<UserAdminOutput> listarUsuarios(Boolean ativo, String role, String search, Pageable pageable) {
        Long orgId = TenantContext.getOrganizationId();

        Specification<Membership> spec = Specification
                .where(MembershipSpecifications.byOrganization(orgId))
                .and(MembershipSpecifications.activeMembership())
                .and(MembershipSpecifications.userAtivo(ativo))
                .and(MembershipSpecifications.roleEquals(role))
                .and(MembershipSpecifications.search(search));

        Page<Membership> membershipPage = membershipRepository.findAll(spec, pageable);

        var contas = carregarContas(membershipPage.getContent());

        return membershipPage.map(membership ->
                UserAdminOutput.from(
                        membership.getUser(),
                        membership,
                        contas.get(membership.getUser().getId())
                )
        );
    }

    /**
     * Busca um usuario pelo ID na organizacao atual.
     */
    @Transactional(readOnly = true)
    public UserAdminOutput buscarUsuario(Long userId) {
        Long orgId = TenantContext.getOrganizationId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        User user = membership.getUser();
        Account account = accountRepository.findByUserIdAndProvider(userId, "local").orElse(null);

        return UserAdminOutput.from(user, membership, account);
    }

    /**
     * Cria um novo usuario na organizacao atual.
     */
    @Transactional
    public UserPasswordResetOutput criarUsuario(UserAdminInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long adminId = TenantContext.getUserId();

        // Verifica se email ja existe
        if (userRepository.existsByEmail(input.email())) {
            throw new EmailAlreadyExistsException(input.email());
        }

        // Nao permite criar OWNER
        if (input.role() == MembershipRole.OWNER) {
            throw new CannotModifyOwnerException("Nao e permitido criar usuario como OWNER");
        }

        // Cria usuario
        User user = new User();
        user.setNome(input.nome());
        user.setEmail(input.email());
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);

        // Gera senha temporaria
        String senhaTemporaria = gerarSenhaTemporaria();

        // Cria account
        Account account = new Account();
        account.setUser(user);
        account.setProvider("local");
        account.setSenhaHash(passwordEncoder.encode(senhaTemporaria));
        account.setBloqueado(false);
        account.setTentativasFalha(0);
        account.setSenhaExpirada(true);
        account.setDataCriacao(LocalDateTime.now());
        accountRepository.save(account);

        // Cria membership
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(adminId, orgId)
                .orElseThrow().getOrganization());
        membership.setPapel(input.role());
        membership.setAtivo(true);
        membership.setDataIngresso(LocalDateTime.now());
        membership.setConvidadoPor(adminId);
        membershipRepository.save(membership);

        log.info("Usuario criado: userId={}, email={}, role={}, criadoPor={}",
                user.getId(), user.getEmail(), input.role(), adminId);

        return UserPasswordResetOutput.of(user.getId(), senhaTemporaria);
    }

    /**
     * Atualiza dados de um usuario.
     */
    @Transactional
    public UserAdminOutput atualizarUsuario(Long userId, UserUpdateInput input) {
        Long orgId = TenantContext.getOrganizationId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        User user = membership.getUser();

        // Verifica se email mudou e ja existe
        if (!user.getEmail().equals(input.email()) && userRepository.existsByEmail(input.email())) {
            throw new EmailAlreadyExistsException(input.email());
        }

        user.setNome(input.nome());
        user.setEmail(input.email());
        user.setDataAtualizacao(LocalDateTime.now());
        userRepository.save(user);

        log.info("Usuario atualizado: userId={}", userId);

        Account account = accountRepository.findByUserIdAndProvider(userId, "local").orElse(null);
        return UserAdminOutput.from(user, membership, account);
    }

    /**
     * Ativa um usuario.
     */
    @Transactional
    public UserAdminOutput ativarUsuario(Long userId) {
        return alterarStatusUsuario(userId, true);
    }

    /**
     * Desativa um usuario (soft delete).
     */
    @Transactional
    public UserAdminOutput desativarUsuario(Long userId) {
        return alterarStatusUsuario(userId, false);
    }

    private UserAdminOutput alterarStatusUsuario(Long userId, boolean ativo) {
        Long orgId = TenantContext.getOrganizationId();
        Long adminId = TenantContext.getUserId();

        // Nao pode desativar a si mesmo
        if (!ativo && userId.equals(adminId)) {
            throw new CannotModifySelfException();
        }

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Nao pode desativar OWNER
        if (!ativo && membership.getPapel() == MembershipRole.OWNER) {
            throw new CannotModifyOwnerException("Nao e permitido desativar o proprietario da organizacao");
        }

        User user = membership.getUser();
        user.setAtivo(ativo);
        user.setDataAtualizacao(LocalDateTime.now());
        userRepository.save(user);

        log.info("Usuario {}: userId={}", ativo ? "ativado" : "desativado", userId);

        Account account = accountRepository.findByUserIdAndProvider(userId, "local").orElse(null);
        return UserAdminOutput.from(user, membership, account);
    }

    /**
     * Altera o papel de um usuario na organizacao.
     */
    @Transactional
    public UserAdminOutput alterarRole(Long userId, UserRoleUpdateInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long adminId = TenantContext.getUserId();

        // Apenas OWNER pode alterar roles
        if (!TenantContext.isOwner()) {
            throw new CannotModifyOwnerException("Apenas o proprietario pode alterar papeis");
        }

        // Nao pode alterar proprio role
        if (userId.equals(adminId)) {
            throw new CannotModifySelfException("Voce nao pode alterar seu proprio papel");
        }

        // Nao pode definir como OWNER
        if (input.role() == MembershipRole.OWNER) {
            throw new CannotModifyOwnerException("Nao e permitido definir outro usuario como OWNER");
        }

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Nao pode alterar OWNER
        if (membership.getPapel() == MembershipRole.OWNER) {
            throw new CannotModifyOwnerException();
        }

        membership.setPapel(input.role());
        membershipRepository.save(membership);

        log.info("Role alterado: userId={}, novoRole={}", userId, input.role());

        User user = membership.getUser();
        Account account = accountRepository.findByUserIdAndProvider(userId, "local").orElse(null);
        return UserAdminOutput.from(user, membership, account);
    }

    /**
     * Reseta a senha de um usuario, gerando uma senha temporaria.
     */
    @Transactional
    public UserPasswordResetOutput resetarSenha(Long userId) {
        Long orgId = TenantContext.getOrganizationId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Account account = accountRepository.findByUserIdAndProvider(userId, "local")
                .orElseThrow(() -> new UserNotFoundException("Usuario nao possui conta local"));

        String senhaTemporaria = gerarSenhaTemporaria();

        account.setSenhaHash(passwordEncoder.encode(senhaTemporaria));
        account.setSenhaExpirada(true);
        account.setDataAlteracaoSenha(LocalDateTime.now());
        account.setBloqueado(false);
        account.setTentativasFalha(0);
        accountRepository.save(account);

        log.info("Senha resetada: userId={}", userId);

        return UserPasswordResetOutput.of(userId, senhaTemporaria);
    }

    /**
     * Desbloqueia a conta de um usuario.
     */
    @Transactional
    public UserAdminOutput desbloquearConta(Long userId) {
        Long orgId = TenantContext.getOrganizationId();

        Membership membership = membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Account account = accountRepository.findByUserIdAndProvider(userId, "local")
                .orElseThrow(() -> new UserNotFoundException("Usuario nao possui conta local"));

        account.desbloquear();
        accountRepository.save(account);

        log.info("Conta desbloqueada: userId={}", userId);

        User user = membership.getUser();
        return UserAdminOutput.from(user, membership, account);
    }

    /**
     * Lista historico de login de um usuario.
     */
    @Transactional(readOnly = true)
    public List<LoginAttemptOutput> listarHistoricoLogin(Long userId) {
        Long orgId = TenantContext.getOrganizationId();

        // Verifica se usuario pertence a organizacao
        membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(userId, orgId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return loginAttemptRepository.findTop10ByUserIdOrderByDataTentativaDesc(userId)
                .stream()
                .map(LoginAttemptOutput::from)
                .toList();
    }

    private Map<Long, Account> carregarContas(List<Membership> memberships) {
        if (memberships == null || memberships.isEmpty()) {
            return Map.of();
        }

        List<Long> userIds = memberships.stream()
                .map(m -> m.getUser().getId())
                .toList();

        return accountRepository.findByUserIdInAndProvider(userIds, "local")
                .stream()
                .collect(Collectors.toMap(account -> account.getUser().getId(), account -> account));
    }

    private String gerarSenhaTemporaria() {
        StringBuilder senha = new StringBuilder(TAMANHO_SENHA);
        for (int i = 0; i < TAMANHO_SENHA; i++) {
            senha.append(CARACTERES_SENHA.charAt(RANDOM.nextInt(CARACTERES_SENHA.length())));
        }
        return senha.toString();
    }
}
