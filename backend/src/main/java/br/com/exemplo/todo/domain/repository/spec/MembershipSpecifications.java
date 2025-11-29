package br.com.exemplo.todo.domain.repository.spec;

import br.com.exemplo.todo.domain.model.entity.Membership;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * Specifications reutilizAveis para filtrar memberships.
 */
public final class MembershipSpecifications {

    private MembershipSpecifications() {}

    public static Specification<Membership> byOrganization(Long organizationId) {
        return (root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId);
    }

    public static Specification<Membership> activeMembership() {
        return (root, query, cb) -> cb.isTrue(root.get("ativo"));
    }

    public static Specification<Membership> userAtivo(Boolean ativo) {
        if (ativo == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("user").get("ativo"), ativo);
    }

    public static Specification<Membership> roleEquals(String role) {
        if (!StringUtils.hasText(role)) {
            return null;
        }
        return (root, query, cb) -> cb.equal(cb.lower(root.get("papel")), role.toLowerCase());
    }

    public static Specification<Membership> search(String term) {
        if (!StringUtils.hasText(term)) {
            return null;
        }
        return (root, query, cb) -> {
            // Evita cartesianas com fetch join + paginacao
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("user", JoinType.INNER);
            }
            String like = "%" + term.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("user").get("nome")), like),
                    cb.like(cb.lower(root.get("user").get("email")), like)
            );
        };
    }

    public static Specification<Membership> withUserFetch() {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("user", JoinType.INNER);
                query.distinct(true);
            }
            return null;
        };
    }
}
