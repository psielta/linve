package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.admin.*;
import br.com.exemplo.todo.domain.exception.*;
import br.com.exemplo.todo.domain.model.entity.*;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.*;
import br.com.exemplo.todo.domain.service.UserAdminService;
import br.com.exemplo.todo.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserAdminService")
class UserAdminServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long ADMIN_USER_ID = 100L;
    private static final Long TARGET_USER_ID = 200L;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAdminService service;

    private User targetUser;
    private Account targetAccount;
    private Membership targetMembership;
    private Organization organization;

    @BeforeEach
    void setUp() {
        organization = new Organization();
        organization.setId(ORG_ID);
        organization.setNome("Org Teste");

        targetUser = new User();
        targetUser.setId(TARGET_USER_ID);
        targetUser.setNome("Usuario Teste");
        targetUser.setEmail("teste@teste.com");
        targetUser.setAtivo(true);
        targetUser.setDataCriacao(LocalDateTime.now());

        targetAccount = new Account();
        targetAccount.setId(1L);
        targetAccount.setUser(targetUser);
        targetAccount.setProvider("local");
        targetAccount.setBloqueado(false);
        targetAccount.setTentativasFalha(0);
        targetAccount.setSenhaExpirada(false);

        targetMembership = new Membership();
        targetMembership.setId(1L);
        targetMembership.setUser(targetUser);
        targetMembership.setOrganization(organization);
        targetMembership.setPapel(MembershipRole.MEMBER);
        targetMembership.setAtivo(true);
        targetMembership.setDataIngresso(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("buscarUsuario")
    class BuscarUsuario {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve retornar usuario quando encontrado")
        void deveRetornarUsuarioQuandoEncontrado() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));

            UserAdminOutput resultado = service.buscarUsuario(TARGET_USER_ID);

            assertThat(resultado).isNotNull();
            assertThat(resultado.id()).isEqualTo(TARGET_USER_ID);
            assertThat(resultado.nome()).isEqualTo("Usuario Teste");
            assertThat(resultado.email()).isEqualTo("teste@teste.com");
            assertThat(resultado.role()).isEqualTo(MembershipRole.MEMBER);
        }

        @Test
        @DisplayName("deve lancar excecao quando usuario nao encontrado")
        void deveLancarExcecaoQuandoNaoEncontrado() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarUsuario(999L))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("criarUsuario")
    class CriarUsuario {

        private Membership adminMembership;

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);

            adminMembership = new Membership();
            adminMembership.setOrganization(organization);
        }

        @Test
        @DisplayName("deve criar usuario com sucesso")
        void deveCriarUsuarioComSucesso() {
            UserAdminInput input = new UserAdminInput("Novo Usuario", "novo@teste.com", MembershipRole.MEMBER);

            when(userRepository.existsByEmail("novo@teste.com")).thenReturn(false);
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(ADMIN_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(adminMembership));
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User u = invocation.getArgument(0);
                u.setId(300L);
                return u;
            });

            UserPasswordResetOutput resultado = service.criarUsuario(input);

            assertThat(resultado).isNotNull();
            assertThat(resultado.userId()).isEqualTo(300L);
            assertThat(resultado.senhaTemporaria()).isNotNull();
            assertThat(resultado.senhaTemporaria().length()).isEqualTo(12);

            verify(userRepository).save(any(User.class));
            verify(accountRepository).save(any(Account.class));
            verify(membershipRepository).save(any(Membership.class));
        }

        @Test
        @DisplayName("deve lancar excecao quando email ja existe")
        void deveLancarExcecaoQuandoEmailJaExiste() {
            UserAdminInput input = new UserAdminInput("Novo Usuario", "existente@teste.com", MembershipRole.MEMBER);

            when(userRepository.existsByEmail("existente@teste.com")).thenReturn(true);

            assertThatThrownBy(() -> service.criarUsuario(input))
                    .isInstanceOf(EmailAlreadyExistsException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve lancar excecao ao tentar criar OWNER")
        void deveLancarExcecaoAoCriarOwner() {
            UserAdminInput input = new UserAdminInput("Novo Owner", "owner@teste.com", MembershipRole.OWNER);

            when(userRepository.existsByEmail("owner@teste.com")).thenReturn(false);

            assertThatThrownBy(() -> service.criarUsuario(input))
                    .isInstanceOf(CannotModifyOwnerException.class);

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("atualizarUsuario")
    class AtualizarUsuario {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve atualizar usuario com sucesso")
        void deveAtualizarUsuarioComSucesso() {
            UserUpdateInput input = new UserUpdateInput("Nome Atualizado", "novoemail@teste.com");

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(userRepository.existsByEmail("novoemail@teste.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(targetUser);
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));

            UserAdminOutput resultado = service.atualizarUsuario(TARGET_USER_ID, input);

            assertThat(resultado).isNotNull();
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("deve lancar excecao quando novo email ja existe")
        void deveLancarExcecaoQuandoNovoEmailJaExiste() {
            UserUpdateInput input = new UserUpdateInput("Nome", "outro@teste.com");

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(userRepository.existsByEmail("outro@teste.com")).thenReturn(true);

            assertThatThrownBy(() -> service.atualizarUsuario(TARGET_USER_ID, input))
                    .isInstanceOf(EmailAlreadyExistsException.class);
        }
    }

    @Nested
    @DisplayName("desativarUsuario")
    class DesativarUsuario {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve desativar usuario com sucesso")
        void deveDesativarUsuarioComSucesso() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(userRepository.save(any(User.class))).thenReturn(targetUser);
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));

            UserAdminOutput resultado = service.desativarUsuario(TARGET_USER_ID);

            assertThat(resultado).isNotNull();
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("deve lancar excecao ao tentar desativar a si mesmo")
        void deveLancarExcecaoAoDesativarSiMesmo() {
            TenantContext.set(ORG_ID, TARGET_USER_ID, MembershipRole.ADMIN);

            assertThatThrownBy(() -> service.desativarUsuario(TARGET_USER_ID))
                    .isInstanceOf(CannotModifySelfException.class);
        }

        @Test
        @DisplayName("deve lancar excecao ao tentar desativar OWNER")
        void deveLancarExcecaoAoDesativarOwner() {
            targetMembership.setPapel(MembershipRole.OWNER);

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));

            assertThatThrownBy(() -> service.desativarUsuario(TARGET_USER_ID))
                    .isInstanceOf(CannotModifyOwnerException.class);
        }
    }

    @Nested
    @DisplayName("ativarUsuario")
    class AtivarUsuario {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve ativar usuario com sucesso")
        void deveAtivarUsuarioComSucesso() {
            targetUser.setAtivo(false);

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(userRepository.save(any(User.class))).thenReturn(targetUser);
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));

            UserAdminOutput resultado = service.ativarUsuario(TARGET_USER_ID);

            assertThat(resultado).isNotNull();
            verify(userRepository).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("alterarRole")
    class AlterarRole {

        @Test
        @DisplayName("deve alterar role com sucesso quando OWNER")
        void deveAlterarRoleComSucessoQuandoOwner() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.OWNER);

            UserRoleUpdateInput input = new UserRoleUpdateInput(MembershipRole.ADMIN);

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(membershipRepository.save(any(Membership.class))).thenReturn(targetMembership);
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));

            UserAdminOutput resultado = service.alterarRole(TARGET_USER_ID, input);

            assertThat(resultado).isNotNull();
            verify(membershipRepository).save(any(Membership.class));
        }

        @Test
        @DisplayName("deve lancar excecao quando nao for OWNER")
        void deveLancarExcecaoQuandoNaoForOwner() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);

            UserRoleUpdateInput input = new UserRoleUpdateInput(MembershipRole.ADMIN);

            assertThatThrownBy(() -> service.alterarRole(TARGET_USER_ID, input))
                    .isInstanceOf(CannotModifyOwnerException.class);
        }

        @Test
        @DisplayName("deve lancar excecao ao tentar definir como OWNER")
        void deveLancarExcecaoAoDefinirComoOwner() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.OWNER);

            UserRoleUpdateInput input = new UserRoleUpdateInput(MembershipRole.OWNER);

            assertThatThrownBy(() -> service.alterarRole(TARGET_USER_ID, input))
                    .isInstanceOf(CannotModifyOwnerException.class);
        }

        @Test
        @DisplayName("deve lancar excecao ao tentar alterar proprio role")
        void deveLancarExcecaoAoAlterarProprioRole() {
            TenantContext.set(ORG_ID, TARGET_USER_ID, MembershipRole.OWNER);

            UserRoleUpdateInput input = new UserRoleUpdateInput(MembershipRole.ADMIN);

            assertThatThrownBy(() -> service.alterarRole(TARGET_USER_ID, input))
                    .isInstanceOf(CannotModifySelfException.class);
        }
    }

    @Nested
    @DisplayName("resetarSenha")
    class ResetarSenha {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve resetar senha com sucesso")
        void deveResetarSenhaComSucesso() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(accountRepository.save(any(Account.class))).thenReturn(targetAccount);

            UserPasswordResetOutput resultado = service.resetarSenha(TARGET_USER_ID);

            assertThat(resultado).isNotNull();
            assertThat(resultado.userId()).isEqualTo(TARGET_USER_ID);
            assertThat(resultado.senhaTemporaria()).isNotNull();
            assertThat(resultado.senhaTemporaria().length()).isEqualTo(12);

            verify(accountRepository).save(any(Account.class));
        }

        @Test
        @DisplayName("deve lancar excecao quando usuario nao possui conta local")
        void deveLancarExcecaoQuandoNaoTemContaLocal() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.resetarSenha(TARGET_USER_ID))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("desbloquearConta")
    class DesbloquearConta {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve desbloquear conta com sucesso")
        void deveDesbloquearContaComSucesso() {
            targetAccount.setBloqueado(true);
            targetAccount.setTentativasFalha(5);

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(accountRepository.findByUserIdAndProvider(TARGET_USER_ID, "local"))
                    .thenReturn(Optional.of(targetAccount));
            when(accountRepository.save(any(Account.class))).thenReturn(targetAccount);

            UserAdminOutput resultado = service.desbloquearConta(TARGET_USER_ID);

            assertThat(resultado).isNotNull();
            verify(accountRepository).save(any(Account.class));
        }
    }

    @Nested
    @DisplayName("listarHistoricoLogin")
    class ListarHistoricoLogin {

        @BeforeEach
        void setUpContext() {
            TenantContext.set(ORG_ID, ADMIN_USER_ID, MembershipRole.ADMIN);
        }

        @Test
        @DisplayName("deve retornar historico de login")
        void deveRetornarHistoricoLogin() {
            LoginAttempt attempt = new LoginAttempt();
            attempt.setId(1L);
            attempt.setUser(targetUser);
            attempt.setSucesso(true);
            attempt.setDataTentativa(LocalDateTime.now());

            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(TARGET_USER_ID, ORG_ID))
                    .thenReturn(Optional.of(targetMembership));
            when(loginAttemptRepository.findTop10ByUserIdOrderByDataTentativaDesc(TARGET_USER_ID))
                    .thenReturn(List.of(attempt));

            List<LoginAttemptOutput> resultado = service.listarHistoricoLogin(TARGET_USER_ID);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).sucesso()).isTrue();
        }

        @Test
        @DisplayName("deve lancar excecao quando usuario nao pertence a organizacao")
        void deveLancarExcecaoQuandoUsuarioNaoPertenceOrg() {
            when(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.listarHistoricoLogin(999L))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }
}
