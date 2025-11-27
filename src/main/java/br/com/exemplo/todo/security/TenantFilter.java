package br.com.exemplo.todo.security;

import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Filtro que resolve o contexto de tenant (organizacao) para cada requisicao.
 * Extrai X-Organization-Id do header e valida membership do usuario.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TenantFilter extends OncePerRequestFilter {

    private final MembershipRepository membershipRepository;

    private static final String ORG_HEADER = "X-Organization-Id";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            resolveAndSetTenantContext(request, response);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private void resolveAndSetTenantContext(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Se nao ha usuario autenticado, nao resolve tenant
        if (auth == null || !auth.isAuthenticated() ||
            !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            return;
        }

        String orgHeader = request.getHeader(ORG_HEADER);

        // Se nao ha header de organizacao, tenta obter a primeira membership
        if (!StringUtils.hasText(orgHeader)) {
            Optional<Membership> defaultMembership = membershipRepository
                    .findFirstByUserIdAndAtivoTrueOrderByDataIngressoAsc(user.getUserId());

            if (defaultMembership.isPresent()) {
                Membership membership = defaultMembership.get();
                TenantContext.set(
                        membership.getOrganization().getId(),
                        user.getUserId(),
                        membership.getPapel()
                );
                log.debug("TenantContext definido (default): orgId={}, userId={}, papel={}",
                        membership.getOrganization().getId(), user.getUserId(), membership.getPapel());
            }
            return;
        }

        // Valida e configura o tenant do header
        try {
            Long organizationId = Long.parseLong(orgHeader);

            Optional<Membership> membership = membershipRepository
                    .findByUserIdAndOrganizationIdAndAtivoTrue(user.getUserId(), organizationId);

            if (membership.isEmpty()) {
                log.warn("Usuario {} tentou acessar organizacao {} sem membership",
                        user.getUserId(), organizationId);
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"type\":\"/api/errors/acesso-negado-organizacao\"," +
                        "\"title\":\"Acesso negado\"," +
                        "\"status\":403," +
                        "\"detail\":\"Voce nao tem acesso a esta organizacao\"}");
                return;
            }

            TenantContext.set(
                    organizationId,
                    user.getUserId(),
                    membership.get().getPapel()
            );

            log.debug("TenantContext definido: orgId={}, userId={}, papel={}",
                    organizationId, user.getUserId(), membership.get().getPapel());

        } catch (NumberFormatException e) {
            log.warn("Header X-Organization-Id invalido: {}", orgHeader);
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"type\":\"/api/errors/organizacao-invalida\"," +
                    "\"title\":\"Organizacao invalida\"," +
                    "\"status\":400," +
                    "\"detail\":\"O header X-Organization-Id deve ser um numero valido\"}");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs") ||
               path.equals("/") ||
               path.equals("/index.html");
    }
}
