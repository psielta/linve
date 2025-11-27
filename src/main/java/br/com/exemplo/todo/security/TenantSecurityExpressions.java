package br.com.exemplo.todo.security;

import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import org.springframework.stereotype.Component;

/**
 * Expressoes de seguranca para uso com @PreAuthorize.
 * Permite verificacoes de papel baseadas no TenantContext.
 *
 * Exemplos de uso:
 * - @PreAuthorize("@tenantSecurity.isOwner()")
 * - @PreAuthorize("@tenantSecurity.isAdmin()")
 * - @PreAuthorize("@tenantSecurity.isMember()")
 * - @PreAuthorize("@tenantSecurity.hasRole('ADMIN', 'OWNER')")
 */
@Component("tenantSecurity")
public class TenantSecurityExpressions {

    /**
     * Verifica se o TenantContext esta definido.
     */
    public boolean hasTenant() {
        return TenantContext.isSet();
    }

    /**
     * Verifica se usuario e OWNER da organizacao atual.
     */
    public boolean isOwner() {
        return TenantContext.isOwner();
    }

    /**
     * Verifica se usuario e ADMIN ou OWNER da organizacao atual.
     */
    public boolean isAdmin() {
        return TenantContext.isAdmin();
    }

    /**
     * Verifica se usuario e membro da organizacao atual (qualquer papel).
     */
    public boolean isMember() {
        return TenantContext.isSet();
    }

    /**
     * Verifica se usuario tem algum dos papeis informados.
     */
    public boolean hasRole(String... roles) {
        if (!TenantContext.isSet()) {
            return false;
        }
        MembershipRole currentRole = TenantContext.getRole();
        for (String role : roles) {
            try {
                if (currentRole == MembershipRole.valueOf(role.toUpperCase())) {
                    return true;
                }
            } catch (IllegalArgumentException ignored) {
                // Papel invalido, ignora
            }
        }
        return false;
    }

    /**
     * Verifica se usuario atual tem o ID especificado.
     */
    public boolean isCurrentUser(Long userId) {
        return TenantContext.isSet() && TenantContext.getUserId().equals(userId);
    }

    /**
     * Verifica se usuario esta na organizacao especificada.
     */
    public boolean isInOrganization(Long organizationId) {
        return TenantContext.isSet() && TenantContext.getOrganizationId().equals(organizationId);
    }
}
