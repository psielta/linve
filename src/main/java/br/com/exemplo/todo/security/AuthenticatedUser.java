package br.com.exemplo.todo.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Principal que representa o usuario autenticado via JWT.
 */
@Getter
public class AuthenticatedUser implements UserDetails {

    private final Long userId;
    private final String email;
    private final String nome;

    public AuthenticatedUser(Long userId, String email, String nome) {
        this.userId = userId;
        this.email = email;
        this.nome = nome;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Authorities sao definidas pelo TenantContext com base na membership
        return List.of();
    }

    @Override
    public String getPassword() {
        return null; // JWT stateless, nao armazena senha
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
