package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para acesso a dados de Account.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Busca conta local de um usuario.
     */
    Optional<Account> findByUserIdAndProvider(Long userId, String provider);

    /**
     * Busca conta local de um usuario (provider = 'local').
     */
    default Optional<Account> findLocalAccountByUserId(Long userId) {
        return findByUserIdAndProvider(userId, "local");
    }

    /**
     * Busca conta pelo email do usuario e provider.
     */
    Optional<Account> findByUserEmailAndProvider(String email, String provider);

    /**
     * Busca conta local pelo email do usuario.
     */
    default Optional<Account> findLocalAccountByEmail(String email) {
        return findByUserEmailAndProvider(email, "local");
    }

    /**
     * Verifica se usuario tem conta local.
     */
    boolean existsByUserIdAndProvider(Long userId, String provider);
}
