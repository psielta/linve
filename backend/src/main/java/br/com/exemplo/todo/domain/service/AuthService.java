package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.auth.*;
import br.com.exemplo.todo.config.JwtConfig;
import br.com.exemplo.todo.config.AuthProperties;
import br.com.exemplo.todo.domain.exception.AccountLockedException;
import br.com.exemplo.todo.domain.exception.EmailAlreadyExistsException;
import br.com.exemplo.todo.domain.exception.InvalidCredentialsException;
import br.com.exemplo.todo.domain.exception.InvalidRefreshTokenException;
import br.com.exemplo.todo.domain.model.entity.*;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.*;
import br.com.exemplo.todo.domain.exception.PasswordExpiredException;
import br.com.exemplo.todo.infrastructure.email.EmailTemplateService;
import br.com.exemplo.todo.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final AuthProperties authProperties;

    @Transactional
    public AuthResponse register(RegisterInput input, HttpServletRequest request) {
        // Verifica se email ja existe
        if (userRepository.existsByEmail(input.email())) {
            throw new EmailAlreadyExistsException(input.email());
        }

        // Cria usuario
        User user = new User();
        user.setNome(input.nome());
        user.setEmail(input.email());
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);

        // Cria account com senha
        Account account = new Account();
        account.setUser(user);
        account.setProvider("local");
        account.setSenhaHash(passwordEncoder.encode(input.senha()));
        account.setBloqueado(false);
        account.setTentativasFalha(0);
        account.setDataCriacao(LocalDateTime.now());
        accountRepository.save(account);

        // Cria organizacao inicial
        String orgName = StringUtils.hasText(input.nomeOrganizacao())
                ? input.nomeOrganizacao()
                : "Organizacao de " + input.nome();

        Organization organization = new Organization();
        organization.setNome(orgName);
        organization.setSlug(generateSlug(orgName));
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
        membershipRepository.save(membership);

        log.info("Novo usuario registrado: userId={}, email={}", user.getId(), user.getEmail());

        return generateAuthResponse(user, request);
    }

    @Transactional
    public AuthResponse login(LoginInput input, HttpServletRequest request) {
        String ipAddress = extractIpAddress(request);
        String userAgent = extractDeviceInfo(request);

        // Busca usuario
        User user = userRepository.findByEmail(input.email())
                .orElseThrow(() -> {
                    log.warn("Tentativa de login com email inexistente: {}", input.email());
                    return new InvalidCredentialsException();
                });

        // Busca account local
        Account account = accountRepository.findByUserIdAndProvider(user.getId(), "local")
                .orElseThrow(InvalidCredentialsException::new);

        // Verifica bloqueio
        if (Boolean.TRUE.equals(account.getBloqueado())) {
            registrarTentativaLogin(user, false, ipAddress, userAgent, "ACCOUNT_LOCKED");
            log.warn("Tentativa de login em conta bloqueada: userId={}", user.getId());
            throw new AccountLockedException();
        }

        // Verifica se usuario esta ativo
        if (!Boolean.TRUE.equals(user.getAtivo())) {
            registrarTentativaLogin(user, false, ipAddress, userAgent, "USER_INACTIVE");
            log.warn("Tentativa de login em conta inativa: userId={}", user.getId());
            throw new InvalidCredentialsException("Usuario inativo");
        }

        // Verifica senha
        if (!passwordEncoder.matches(input.senha(), account.getSenhaHash())) {
            boolean shouldBlock = account.incrementarTentativasFalha();
            if (shouldBlock) {
                account.bloquear();
            }
            accountRepository.save(account);
            registrarTentativaLogin(user, false, ipAddress, userAgent, "INVALID_PASSWORD");
            log.warn("Senha incorreta para usuario: userId={}, tentativas={}",
                    user.getId(), account.getTentativasFalha());
            throw new InvalidCredentialsException();
        }

        // Reset tentativas de login
        account.resetarTentativasFalha();
        accountRepository.save(account);

        // Registra tentativa de sucesso
        registrarTentativaLogin(user, true, ipAddress, userAgent, null);

        // Atualiza ultimo acesso
        user.setUltimoAcesso(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login realizado: userId={}, email={}", user.getId(), user.getEmail());

        // Verifica se senha esta expirada
        boolean senhaExpirada = Boolean.TRUE.equals(account.getSenhaExpirada());

        return generateAuthResponse(user, request, senhaExpirada);
    }

    private void registrarTentativaLogin(User user, boolean sucesso, String ipAddress, String userAgent, String motivoFalha) {
        LoginAttempt attempt = new LoginAttempt(user, sucesso, ipAddress, userAgent, motivoFalha);
        loginAttemptRepository.save(attempt);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenInput input, HttpServletRequest request) {
        String tokenHash = jwtService.hashToken(input.refreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        // Verifica se token esta valido
        if (Boolean.TRUE.equals(storedToken.getRevogado()) || storedToken.isExpirado()) {
            // Possivelmente roubo de token - revoga toda a familia
            if (!Boolean.TRUE.equals(storedToken.getRevogado())) {
                revokeTokenFamily(storedToken.getFamiliaId());
                log.warn("Possivel roubo de refresh token detectado: familyId={}",
                        storedToken.getFamiliaId());
            }
            throw new InvalidRefreshTokenException();
        }

        User user = storedToken.getUser();

        // Revoga token atual (rotacao)
        storedToken.revogar();
        refreshTokenRepository.save(storedToken);

        log.debug("Refresh token renovado para userId={}", user.getId());

        // Verifica se senha esta expirada
        Account account = accountRepository.findByUserIdAndProvider(user.getId(), "local").orElse(null);
        boolean senhaExpirada = account != null && Boolean.TRUE.equals(account.getSenhaExpirada());

        // Gera novos tokens com mesmo familyId
        return generateAuthResponse(user, request, storedToken.getFamiliaId(), senhaExpirada);
    }

    /**
     * Envia um magic link de login para o email informado.
     * Nao revela se o email existe ou nao no sistema.
     */
    @Transactional
    public void enviarMagicLink(String email, HttpServletRequest request) {
        if (!StringUtils.hasText(email)) {
            return;
        }

        userRepository.findByEmail(email).ifPresent(user -> {
            String token = jwtService.generateMagicLoginToken(user);

            String baseUrl = authProperties.getBaseUrl();
            String magicUrl = baseUrl + "?token=" + java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8);

            // Prepara variaveis do template
            Map<String, String> variables = new HashMap<>();
            variables.put("userName", user.getNome());
            variables.put("magicLink", magicUrl);
            variables.put("expirationMinutes", String.valueOf(jwtConfig.getMagicLink().getExpirationMinutes()));

            String html = emailTemplateService.processTemplate("magic-link.html", variables);

            emailService.send(user.getEmail(), "Seu link de acesso - Linve", html);
            log.info("Magic link enviado para {}", user.getEmail());
        });
    }

    @Transactional
    public void logout(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return;
        }

        String tokenHash = jwtService.hashToken(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    // Revoga toda a familia de tokens
                    revokeTokenFamily(token.getFamiliaId());
                    log.debug("Logout realizado: userId={}", token.getUser().getId());
                });
    }

    /**
     * Realiza login usando um magic link enviado por e-mail.
     */
    @Transactional
    public AuthResponse loginViaMagicLink(String token, HttpServletRequest request) {
        var claimsOpt = jwtService.validateMagicLoginToken(token);
        if (claimsOpt.isEmpty()) {
            throw new InvalidCredentialsException("Magic link invalido ou expirado");
        }

        var claims = claimsOpt.get();
        Long userId = jwtService.extractUserId(claims);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Usuario nao encontrado para magic link"));

        Account account = accountRepository.findByUserIdAndProvider(user.getId(), "local").orElse(null);

        // Verifica bloqueio
        if (account != null && Boolean.TRUE.equals(account.getBloqueado())) {
            log.warn("Tentativa de login via magic link em conta bloqueada: userId={}", user.getId());
            throw new AccountLockedException();
        }

        // Verifica se usuario esta ativo
        if (!Boolean.TRUE.equals(user.getAtivo())) {
            log.warn("Tentativa de login via magic link em conta inativa: userId={}", user.getId());
            throw new InvalidCredentialsException("Usuario inativo");
        }

        // Registra tentativa de sucesso
        registrarTentativaLogin(user, true, extractIpAddress(request), extractDeviceInfo(request), "MAGIC_LINK");

        // Atualiza ultimo acesso
        user.setUltimoAcesso(LocalDateTime.now());
        userRepository.save(user);

        boolean senhaExpirada = account != null && Boolean.TRUE.equals(account.getSenhaExpirada());

        return generateAuthResponse(user, request, senhaExpirada);
    }

    private AuthResponse generateAuthResponse(User user, HttpServletRequest request) {
        return generateAuthResponse(user, request, UUID.randomUUID().toString(), false);
    }

    private AuthResponse generateAuthResponse(User user, HttpServletRequest request, boolean senhaExpirada) {
        return generateAuthResponse(user, request, UUID.randomUUID().toString(), senhaExpirada);
    }

    private AuthResponse generateAuthResponse(User user, HttpServletRequest request, String familyId, boolean senhaExpirada) {
        // Gera access token
        String accessToken = jwtService.generateAccessToken(user);

        // Gera refresh token
        String rawRefreshToken = jwtService.generateRefreshToken();
        String tokenHash = jwtService.hashToken(rawRefreshToken);

        // Persiste refresh token
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setTokenHash(tokenHash);
        refreshTokenEntity.setDataExpiracao(LocalDateTime.now().plusDays(jwtConfig.getRefreshToken().getExpirationDays()));
        refreshTokenEntity.setRevogado(false);
        refreshTokenEntity.setFamiliaId(familyId);
        refreshTokenEntity.setDeviceInfo(extractDeviceInfo(request));
        refreshTokenEntity.setIpAddress(extractIpAddress(request));
        refreshTokenEntity.setDataCriacao(LocalDateTime.now());
        refreshTokenRepository.save(refreshTokenEntity);

        // Busca memberships do usuario
        List<MembershipOutput> memberships = membershipRepository
                .findByUserIdAndAtivoTrueOrderByDataIngressoAsc(user.getId())
                .stream()
                .map(MembershipOutput::from)
                .toList();

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                jwtConfig.getAccessToken().getExpirationMs() / 1000,
                UserOutput.from(user),
                memberships,
                senhaExpirada
        );
    }

    private void revokeTokenFamily(String familyId) {
        refreshTokenRepository.revokeByFamiliaId(familyId);
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

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 255)) : null;
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
