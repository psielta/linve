package br.com.exemplo.todo.domain.model.enums;

/**
 * Papeis de um usuario dentro de uma organizacao.
 */
public enum MembershipRole {

    /**
     * Proprietario da organizacao - controle total.
     * Pode excluir a organizacao e gerenciar todos os membros.
     */
    OWNER,

    /**
     * Administrador - pode gerenciar membros e configuracoes.
     * Todas as operacoes CRUD, exceto excluir a organizacao.
     */
    ADMIN,

    /**
     * Membro comum - acesso basico.
     * Pode criar, ler e atualizar recursos, mas com restricoes de exclusao.
     */
    MEMBER
}
