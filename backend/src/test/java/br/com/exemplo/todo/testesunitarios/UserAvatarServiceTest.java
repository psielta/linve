package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.domain.exception.CannotModifyOwnerException;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.UserRepository;
import br.com.exemplo.todo.domain.service.FileStorageService;
import br.com.exemplo.todo.domain.service.UserAvatarService;
import br.com.exemplo.todo.security.TenantContext;
import br.com.exemplo.todo.security.TenantInfo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

class UserAvatarServiceTest {

    private UserRepository userRepository;
    private MembershipRepository membershipRepository;
    private FileStorageService fileStorageService;
    private UserAvatarService userAvatarService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        membershipRepository = mock(MembershipRepository.class);
        fileStorageService = mock(FileStorageService.class);
        userAvatarService = new UserAvatarService(userRepository, membershipRepository, fileStorageService);

        TenantContext.set(new TenantInfo(1L, 10L, MembershipRole.ADMIN));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void deveAtualizarAvatarDoProprioUsuario() {
        User user = criarUser(10L, null);
        Membership membership = criarMembership(user, MembershipRole.ADMIN);
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(membership));
        given(userRepository.save(any(User.class))).willAnswer(i -> i.getArgument(0));

        var stored = new br.com.exemplo.todo.domain.model.entity.StoredFile();
        stored.setId(UUID.randomUUID());
        given(fileStorageService.store(any(), eq(MediaOwnerType.USER), eq(10L))).willReturn(stored);

        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", "abc".getBytes());

        User updated = userAvatarService.atualizarAvatar(10L, file);

        assertThat(updated.getAvatar()).isEqualTo("/api/media/" + stored.getId());
        verify(fileStorageService, never()).delete(any());
    }

    @Test
    void deveSubstituirAvatarApagandoAnterior() {
        UUID antigo = UUID.randomUUID();
        User user = criarUser(20L, "/api/media/" + antigo);
        Membership membership = criarMembership(user, MembershipRole.MEMBER);
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(20L, 1L))
                .willReturn(Optional.of(membership));
        given(userRepository.save(any(User.class))).willAnswer(i -> i.getArgument(0));

        var stored = new br.com.exemplo.todo.domain.model.entity.StoredFile();
        stored.setId(UUID.randomUUID());
        given(fileStorageService.store(any(), eq(MediaOwnerType.USER), eq(20L))).willReturn(stored);

        MockMultipartFile file = new MockMultipartFile(
                "file", "novo.png", "image/png", "xyz".getBytes());

        userAvatarService.atualizarAvatar(20L, file);

        verify(fileStorageService).delete(antigo);
        assertThat(user.getAvatar()).isEqualTo("/api/media/" + stored.getId());
    }

    @Test
    void adminNaoPodeAlterarAvatarDeOwner() {
        TenantContext.set(new TenantInfo(1L, 99L, MembershipRole.ADMIN));
        User ownerUser = criarUser(20L, null);
        Membership membership = criarMembership(ownerUser, MembershipRole.OWNER);
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(20L, 1L))
                .willReturn(Optional.of(membership));

        MockMultipartFile file = new MockMultipartFile(
                "file", "a.png", "image/png", "a".getBytes());

        assertThatThrownBy(() -> userAvatarService.atualizarAvatar(20L, file))
                .isInstanceOf(CannotModifyOwnerException.class);
    }

    @Test
    void deveLancarQuandoUsuarioNaoPertenceOrganizacao() {
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(30L, 1L))
                .willReturn(Optional.empty());

        MockMultipartFile file = new MockMultipartFile(
                "file", "a.png", "image/png", "a".getBytes());

        assertThatThrownBy(() -> userAvatarService.atualizarAvatar(30L, file))
                .isInstanceOf(UserNotFoundException.class);
    }

    private User criarUser(Long id, String avatar) {
        User u = new User();
        u.setId(id);
        u.setNome("User " + id);
        u.setEmail("user" + id + "@mail.com");
        u.setAtivo(true);
        u.setDataCriacao(LocalDateTime.now());
        u.setAvatar(avatar);
        return u;
    }

    private Membership criarMembership(User user, MembershipRole role) {
        Membership m = new Membership();
        m.setUser(user);
        m.setPapel(role);
        return m;
    }
}
