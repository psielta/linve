package br.com.exemplo.todo.security;

import br.com.exemplo.todo.domain.model.enums.MembershipRole;

/**
 * Record que armazena informacoes do tenant (organizacao) atual.
 */
public record TenantInfo(
        Long organizationId,
        Long userId,
        MembershipRole role
) {
    /**
     * Verifica se usuario e OWNER da organizacao.
     */
    public boolean isOwner() {
        return role == MembershipRole.OWNER;
    }

    /**
     * Verifica se usuario e ADMIN ou OWNER da organizacao.
     */
    public boolean isAdmin() {
        return role == MembershipRole.ADMIN || role == MembershipRole.OWNER;
    }

    /**
     * Verifica se usuario e membro da organizacao (qualquer papel).
     */
    public boolean isMember() {
        return role != null;
    }

    /**
     * Verifica se usuario tem algum dos papeis informados.
     */
    public boolean hasRole(MembershipRole... roles) {
        for (MembershipRole r : roles) {
            if (this.role == r) {
                return true;
            }
        }
        return false;
    }
}
