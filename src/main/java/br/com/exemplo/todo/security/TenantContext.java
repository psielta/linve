package br.com.exemplo.todo.security;

import br.com.exemplo.todo.domain.model.enums.MembershipRole;

import java.util.Optional;

/**
 * Contexto de tenant (organizacao) usando ThreadLocal.
 * Armazena informacoes da organizacao ativa para a requisicao atual.
 */
public final class TenantContext {

    private static final ThreadLocal<TenantInfo> CONTEXT = new ThreadLocal<>();

    private TenantContext() {
        // Classe utilitaria, nao instanciar
    }

    /**
     * Define o contexto do tenant para a thread atual.
     */
    public static void set(Long organizationId, Long userId, MembershipRole role) {
        CONTEXT.set(new TenantInfo(organizationId, userId, role));
    }

    /**
     * Define o contexto do tenant usando TenantInfo.
     */
    public static void set(TenantInfo tenantInfo) {
        CONTEXT.set(tenantInfo);
    }

    /**
     * Retorna o contexto do tenant atual (opcional).
     */
    public static Optional<TenantInfo> get() {
        return Optional.ofNullable(CONTEXT.get());
    }

    /**
     * Retorna o contexto do tenant atual ou lanca excecao se nao definido.
     */
    public static TenantInfo require() {
        return get().orElseThrow(() ->
            new IllegalStateException("TenantContext nao definido para esta requisicao"));
    }

    /**
     * Retorna o ID da organizacao atual.
     */
    public static Long getOrganizationId() {
        return require().organizationId();
    }

    /**
     * Retorna o ID do usuario atual.
     */
    public static Long getUserId() {
        return require().userId();
    }

    /**
     * Retorna o papel do usuario na organizacao atual.
     */
    public static MembershipRole getRole() {
        return require().role();
    }

    /**
     * Verifica se usuario e OWNER da organizacao.
     */
    public static boolean isOwner() {
        return get().map(TenantInfo::isOwner).orElse(false);
    }

    /**
     * Verifica se usuario e ADMIN ou OWNER da organizacao.
     */
    public static boolean isAdmin() {
        return get().map(TenantInfo::isAdmin).orElse(false);
    }

    /**
     * Verifica se ha um tenant definido.
     */
    public static boolean isSet() {
        return CONTEXT.get() != null;
    }

    /**
     * Limpa o contexto do tenant. DEVE ser chamado ao final de cada requisicao.
     */
    public static void clear() {
        CONTEXT.remove();
    }
}
