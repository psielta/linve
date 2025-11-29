package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.domain.exception.OrganizationAccessDeniedException;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
import br.com.exemplo.todo.domain.service.FileStorageService;
import br.com.exemplo.todo.domain.service.OrganizationLogoService;
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

class OrganizationLogoServiceTest {

    private OrganizationRepository organizationRepository;
    private MembershipRepository membershipRepository;
    private FileStorageService fileStorageService;
    private OrganizationLogoService organizationLogoService;

    @BeforeEach
    void setUp() {
        organizationRepository = mock(OrganizationRepository.class);
        membershipRepository = mock(MembershipRepository.class);
        fileStorageService = mock(FileStorageService.class);
        organizationLogoService = new OrganizationLogoService(
                organizationRepository, membershipRepository, fileStorageService);

        TenantContext.set(new TenantInfo(1L, 10L, MembershipRole.ADMIN));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void deveAtualizarLogoQuandoArquivoValido() {
        Organization org = criarOrg(null);
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(criarMembership(MembershipRole.ADMIN)));

        var stored = new br.com.exemplo.todo.domain.model.entity.StoredFile();
        stored.setId(UUID.randomUUID());
        given(fileStorageService.store(any(), eq(MediaOwnerType.ORGANIZATION), eq(1L))).willReturn(stored);

        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "123".getBytes());

        Organization updated = organizationLogoService.atualizarLogo(1L, file);

        assertThat(updated.getLogo()).isEqualTo("/api/media/" + stored.getId());
        verify(fileStorageService, never()).delete(any());
        verify(organizationRepository).save(updated);
    }

    @Test
    void deveSubstituirLogoApagandoAnterior() {
        UUID anterior = UUID.randomUUID();
        Organization org = criarOrg("/api/media/" + anterior);
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(criarMembership(MembershipRole.OWNER)));

        var stored = new br.com.exemplo.todo.domain.model.entity.StoredFile();
        stored.setId(UUID.randomUUID());
        given(fileStorageService.store(any(), eq(MediaOwnerType.ORGANIZATION), eq(1L))).willReturn(stored);

        MockMultipartFile novoLogo = new MockMultipartFile(
                "file", "novo.png", "image/png", "abc".getBytes());

        organizationLogoService.atualizarLogo(1L, novoLogo);

        verify(fileStorageService).delete(anterior);
        verify(organizationRepository).save(org);
        assertThat(org.getLogo()).isEqualTo("/api/media/" + stored.getId());
    }

    @Test
    void deveRemoverLogo() {
        UUID anterior = UUID.randomUUID();
        Organization org = criarOrg("/api/media/" + anterior);
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(criarMembership(MembershipRole.ADMIN)));

        organizationLogoService.removerLogo(1L);

        verify(fileStorageService).delete(anterior);
        assertThat(org.getLogo()).isNull();
    }

    @Test
    void devePermitirEditarLogoDeOutraOrgQuandoTemPermissao() {
        // Usuário está na org 2 mas é ADMIN na org 1, deve poder editar
        TenantContext.set(new TenantInfo(2L, 10L, MembershipRole.MEMBER));

        Organization org = criarOrg(null);
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(criarMembership(MembershipRole.ADMIN)));

        var stored = new br.com.exemplo.todo.domain.model.entity.StoredFile();
        stored.setId(UUID.randomUUID());
        given(fileStorageService.store(any(), eq(MediaOwnerType.ORGANIZATION), eq(1L))).willReturn(stored);

        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "123".getBytes());

        Organization updated = organizationLogoService.atualizarLogo(1L, file);

        assertThat(updated.getLogo()).isEqualTo("/api/media/" + stored.getId());
    }

    @Test
    void deveNegarQuandoUsuarioNaoTemPermissaoNaOrganizacao() {
        // Usuário 10 tenta editar org 1, mas não tem membership ADMIN/OWNER nela
        Organization org = criarOrg("/api/media/" + UUID.randomUUID());
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.empty()); // Sem membership

        assertThatThrownBy(() -> organizationLogoService.removerLogo(1L))
                .isInstanceOf(OrganizationAccessDeniedException.class);
    }

    @Test
    void deveNegarQuandoUsuarioEhApenasMembro() {
        // Usuário 10 é MEMBER na org 1, não pode editar logo
        Organization org = criarOrg("/api/media/" + UUID.randomUUID());
        given(organizationRepository.findById(1L)).willReturn(Optional.of(org));
        given(membershipRepository.findByUserIdAndOrganizationIdAndAtivoTrue(10L, 1L))
                .willReturn(Optional.of(criarMembership(MembershipRole.MEMBER)));

        assertThatThrownBy(() -> organizationLogoService.removerLogo(1L))
                .isInstanceOf(OrganizationAccessDeniedException.class);
    }

    private Organization criarOrg(String logo) {
        Organization org = new Organization();
        org.setId(1L);
        org.setNome("Org");
        org.setSlug("org");
        org.setLogo(logo);
        org.setAtiva(true);
        org.setDataCriacao(LocalDateTime.now());
        return org;
    }

    private Membership criarMembership(MembershipRole role) {
        Membership m = new Membership();
        m.setPapel(role);
        return m;
    }
}
