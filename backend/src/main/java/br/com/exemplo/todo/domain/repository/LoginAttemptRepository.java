package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.LoginAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para acesso a dados de LoginAttempt.
 */
@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    /**
     * Busca tentativas de login de um usuario ordenadas por data decrescente.
     */
    List<LoginAttempt> findByUserIdOrderByDataTentativaDesc(Long userId);

    /**
     * Busca tentativas de login de um usuario com paginacao.
     */
    Page<LoginAttempt> findByUserIdOrderByDataTentativaDesc(Long userId, Pageable pageable);

    /**
     * Busca as ultimas 10 tentativas de login de um usuario.
     */
    List<LoginAttempt> findTop10ByUserIdOrderByDataTentativaDesc(Long userId);
}
