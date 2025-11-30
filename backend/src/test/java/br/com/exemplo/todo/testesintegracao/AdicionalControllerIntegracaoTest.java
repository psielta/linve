package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.api.dto.adicional.AdicionalInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOpcaoInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOutput;
import br.com.exemplo.todo.domain.model.entity.Adicional;
import br.com.exemplo.todo.domain.model.entity.AdicionalItem;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.AdicionalItemRepository;
import br.com.exemplo.todo.domain.repository.AdicionalRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
import br.com.exemplo.todo.domain.repository.UserRepository;
import br.com.exemplo.todo.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("testes")
@DisplayName("AdicionalController - Testes de Integracao")
class AdicionalControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AdicionalRepository adicionalRepository;

    @Autowired
    private AdicionalItemRepository adicionalItemRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private JwtService jwtService;

    private HttpHeaders authHeaders;
    private Long categoriaId;

    @BeforeEach
    void setUp() {
        adicionalItemRepository.deleteAll();
        adicionalRepository.deleteAll();
        membershipRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();
        categoriaRepository.deleteAll();

        User user = new User();
        user.setNome("Tester");
        user.setEmail("tester@exemplo.com");
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);

        Organization org = new Organization();
        org.setNome("Org Teste");
        org.setSlug("org-teste");
        org.setAtiva(true);
        org.setDataCriacao(LocalDateTime.now());
        org.setDataAtualizacao(LocalDateTime.now());
        org = organizationRepository.save(org);

        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(org);
        membership.setPapel(MembershipRole.OWNER);
        membership.setAtivo(true);
        membership.setDataIngresso(LocalDateTime.now());
        membershipRepository.save(membership);

        Categoria categoria = new Categoria();
        categoria.setOrganizationId(org.getId());
        categoria.setNome("Acais");
        categoria.setDescricao("Categoria test");
        categoria.setAtivo(true);
        categoria.setCulinariaId(4);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria = categoriaRepository.save(categoria);
        categoriaId = categoria.getId();

        String token = jwtService.generateAccessToken(user);

        authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(token);
        authHeaders.set("X-Organization-Id", org.getId().toString());
    }

    @Nested
    @DisplayName("POST /adicionais")
    class Criar {
        @Test
        @DisplayName("deve criar adicional multiplo com itens")
        void deveCriar() {
            AdicionalInput input = inputMultiplo();

            ResponseEntity<AdicionalOutput> response = restTemplate.postForEntity(
                    "/api/adicionais",
                    new HttpEntity<>(input, authHeaders),
                    AdicionalOutput.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOpcoes()).hasSize(2);
        }

        @Test
        @DisplayName("deve retornar 400 quando selecao Q sem limite")
        void deveRetornar400() {
            AdicionalInput input = inputMultiplo();
            input.setSelecao("Q");
            input.setLimite(null);

            ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                    "/api/adicionais",
                    new HttpEntity<>(input, authHeaders),
                    ProblemDetail.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("GET /adicionais")
    class Listar {
        @Test
        @DisplayName("deve listar adicionais por categoria")
        void deveListar() {
            // cria um adicional direto no repo para o filtro
            Adicional adicional = new Adicional();
            adicional.setOrganizationId(Long.valueOf(authHeaders.getFirst("X-Organization-Id")));
            adicional.setCategoriaId(categoriaId);
            adicional.setNome("Extras");
            adicional.setSelecao(br.com.exemplo.todo.domain.model.enums.SelecaoAdicional.M);
            adicional.setAtivo(true);
            adicional.setDataCriacao(LocalDateTime.now());

            AdicionalItem item = new AdicionalItem();
            item.setOrganizationId(adicional.getOrganizationId());
            item.setAdicional(adicional);
            item.setNome("Banana");
            item.setValor(new BigDecimal("1.00"));
            item.setAtivo(true);
            item.setDataCriacao(LocalDateTime.now());
            adicional.setItens(List.of(item));
            adicionalRepository.save(adicional);

            ResponseEntity<AdicionalOutput[]> response = restTemplate.exchange(
                    "/api/adicionais?id_categoria=" + categoriaId,
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    AdicionalOutput[].class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("DELETE /adicionais/{id}")
    class Excluir {
        @Test
        @DisplayName("deve fazer soft delete do adicional")
        void deveExcluir() {
            Adicional adicional = new Adicional();
            adicional.setOrganizationId(Long.valueOf(authHeaders.getFirst("X-Organization-Id")));
            adicional.setCategoriaId(categoriaId);
            adicional.setNome("Extras");
            adicional.setSelecao(br.com.exemplo.todo.domain.model.enums.SelecaoAdicional.M);
            adicional.setAtivo(true);
            adicional.setDataCriacao(LocalDateTime.now());

            Adicional salvo = adicionalRepository.save(adicional);

            ResponseEntity<Void> response = restTemplate.exchange(
                    "/api/adicionais/" + salvo.getId(),
                    HttpMethod.DELETE,
                    new HttpEntity<>(authHeaders),
                    Void.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            Adicional reloaded = adicionalRepository.findById(salvo.getId()).orElseThrow();
            assertThat(reloaded.getAtivo()).isFalse();
        }
    }

    private AdicionalInput inputMultiplo() {
        AdicionalOpcaoInput o1 = new AdicionalOpcaoInput();
        o1.setNome("Chocolate");
        o1.setValor(BigDecimal.valueOf(1));
        o1.setStatus(true);

        AdicionalOpcaoInput o2 = new AdicionalOpcaoInput();
        o2.setNome("Morango");
        o2.setValor(BigDecimal.valueOf(2));
        o2.setStatus(true);

        AdicionalInput input = new AdicionalInput();
        input.setIdCategoria(categoriaId);
        input.setNome("Escolha um adicional novo");
        input.setSelecao("M");
        input.setLimite(3);
        input.setStatus(true);
        input.setOpcoes(List.of(o1, o2));
        return input;
    }
}
