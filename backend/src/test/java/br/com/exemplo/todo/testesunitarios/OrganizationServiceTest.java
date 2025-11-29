package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.auth.MembershipOutput;
import br.com.exemplo.todo.api.dto.organization.OrganizationInput;
import br.com.exemplo.todo.domain.exception.UserNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
import br.com.exemplo.todo.domain.repository.UserRepository;
import br.com.exemplo.todo.domain.service.OrganizationService;
import br.com.exemplo.todo.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrganizationService")
class OrganizationServiceTest {

    private static final Long USER_ID = 100L;
    private static final Long ORG_ID = 1L;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private OrganizationService service;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        user.setNome("Usuario Teste");
        user.setEmail("teste@teste.com");
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext() {
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(USER_ID, "teste@teste.com", "Usuario Teste");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(authenticatedUser);
        SecurityContextHolder.setContext(securityContext);
    }

    @Nested
    @DisplayName("criarOrganizacao")
    class CriarOrganizacao {

        @Test
        @DisplayName("deve criar organizacao com sucesso")
        void deveCriarOrganizacaoComSucesso() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("Minha Nova Empresa");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(organizationRepository.existsBySlug("minha-nova-empresa")).thenReturn(false);
            when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
                Organization org = invocation.getArgument(0);
                org.setId(ORG_ID);
                return org;
            });
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership m = invocation.getArgument(0);
                m.setId(1L);
                return m;
            });

            MembershipOutput resultado = service.criarOrganizacao(input);

            assertThat(resultado).isNotNull();
            assertThat(resultado.organization().id()).isEqualTo(ORG_ID);
            assertThat(resultado.organization().nome()).isEqualTo("Minha Nova Empresa");
            assertThat(resultado.organization().slug()).isEqualTo("minha-nova-empresa");
            assertThat(resultado.role()).isEqualTo(MembershipRole.OWNER);

            verify(organizationRepository).save(any(Organization.class));
            verify(membershipRepository).save(any(Membership.class));
        }

        @Test
        @DisplayName("deve criar slug unico quando ja existe")
        void deveCriarSlugUnicoQuandoJaExiste() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("Empresa Teste");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(organizationRepository.existsBySlug("empresa-teste")).thenReturn(true);
            when(organizationRepository.existsBySlug("empresa-teste-1")).thenReturn(true);
            when(organizationRepository.existsBySlug("empresa-teste-2")).thenReturn(false);
            when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
                Organization org = invocation.getArgument(0);
                org.setId(ORG_ID);
                return org;
            });
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership m = invocation.getArgument(0);
                m.setId(1L);
                return m;
            });

            MembershipOutput resultado = service.criarOrganizacao(input);

            assertThat(resultado).isNotNull();
            assertThat(resultado.organization().slug()).isEqualTo("empresa-teste-2");
        }

        @Test
        @DisplayName("deve lancar excecao quando usuario nao encontrado")
        void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("Nova Org");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.criarOrganizacao(input))
                    .isInstanceOf(UserNotFoundException.class)
                    .hasMessageContaining(USER_ID.toString());

            verify(organizationRepository, never()).save(any());
            verify(membershipRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve criar usuario como OWNER da organizacao")
        void deveCriarUsuarioComoOwner() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("Org Teste");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(organizationRepository.existsBySlug(anyString())).thenReturn(false);
            when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
                Organization org = invocation.getArgument(0);
                org.setId(ORG_ID);
                return org;
            });
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership m = invocation.getArgument(0);
                m.setId(1L);
                return m;
            });

            MembershipOutput resultado = service.criarOrganizacao(input);

            assertThat(resultado.role()).isEqualTo(MembershipRole.OWNER);

            verify(membershipRepository).save(argThat(membership ->
                    membership.getPapel() == MembershipRole.OWNER &&
                    membership.getUser().getId().equals(USER_ID) &&
                    membership.getAtivo()
            ));
        }

        @Test
        @DisplayName("deve gerar slug a partir do nome com caracteres especiais")
        void deveGerarSlugComCaracteresEspeciais() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("Café & Restaurante São Paulo!");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(organizationRepository.existsBySlug("caf-restaurante-so-paulo")).thenReturn(false);
            when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
                Organization org = invocation.getArgument(0);
                org.setId(ORG_ID);
                return org;
            });
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership m = invocation.getArgument(0);
                m.setId(1L);
                return m;
            });

            MembershipOutput resultado = service.criarOrganizacao(input);

            assertThat(resultado).isNotNull();
            assertThat(resultado.organization().slug()).isEqualTo("caf-restaurante-so-paulo");
        }

        @Test
        @DisplayName("deve usar slug padrao quando nome vira string vazia")
        void deveUsarSlugPadraoQuandoNomeVirazioVazio() {
            mockSecurityContext();

            OrganizationInput input = new OrganizationInput("!!!@@@###");

            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(organizationRepository.existsBySlug("org")).thenReturn(false);
            when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
                Organization org = invocation.getArgument(0);
                org.setId(ORG_ID);
                return org;
            });
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership m = invocation.getArgument(0);
                m.setId(1L);
                return m;
            });

            MembershipOutput resultado = service.criarOrganizacao(input);

            assertThat(resultado.organization().slug()).isEqualTo("org");
        }
    }
}
