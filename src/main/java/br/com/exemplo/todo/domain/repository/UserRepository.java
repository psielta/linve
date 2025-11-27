package br.com.exemplo.todo.domain.repository;

import br.com.exemplo.todo.domain.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para acesso a dados de User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca usuario pelo email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca usuario ativo pelo email.
     */
    Optional<User> findByEmailAndAtivoTrue(String email);

    /**
     * Verifica se existe usuario com o email.
     */
    boolean existsByEmail(String email);
}
