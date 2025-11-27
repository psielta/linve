package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository para acesso a dados de RefreshToken.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Busca refresh token valido pelo hash.
     */
    Optional<RefreshToken> findByTokenHashAndRevogadoFalse(String tokenHash);

    /**
     * Busca refresh token pelo hash (incluindo revogados, para verificar roubo).
     */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Revoga todos os tokens de um usuario.
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revogado = true, rt.dataRevogacao = :agora WHERE rt.user.id = :userId AND rt.revogado = false")
    int revogarTodosPorUsuario(@Param("userId") Long userId, @Param("agora") LocalDateTime agora);

    /**
     * Revoga todos os tokens de uma familia (usado em caso de roubo de token).
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revogado = true, rt.dataRevogacao = :agora WHERE rt.familiaId = :familiaId AND rt.revogado = false")
    int revogarFamilia(@Param("familiaId") String familiaId, @Param("agora") LocalDateTime agora);

    /**
     * Revoga todos os tokens de uma familia (versao simplificada).
     */
    default void revokeByFamiliaId(String familiaId) {
        revogarFamilia(familiaId, LocalDateTime.now());
    }

    /**
     * Conta tokens ativos de um usuario.
     */
    long countByUserIdAndRevogadoFalse(Long userId);

    /**
     * Remove tokens expirados (limpeza periodica).
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.dataExpiracao < :agora")
    int removerExpirados(@Param("agora") LocalDateTime agora);

    /**
     * Remove tokens revogados antigos (limpeza periodica).
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revogado = true AND rt.dataRevogacao < :limite")
    int removerRevogadosAntigos(@Param("limite") LocalDateTime limite);
}
