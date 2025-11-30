package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.api.dto.categoria.CategoriaDisponibilidadeDto;
import br.com.exemplo.todo.api.dto.categoria.CategoriaInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoOutput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOutput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.Culinaria;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.repository.CulinariaRepository;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("testes")
@DisplayName("CategoriaController - Testes de Integracao")
class CategoriaControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private CulinariaRepository culinariaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private JwtService jwtService;

    private String accessToken;
    private Long organizationId;
    private Long userId;
    private Integer culinariaId;
    private HttpHeaders authHeaders;

    @BeforeEach
    void setUp() {
        categoriaRepository.deleteAll();
        membershipRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();
        culinariaRepository.deleteAll();

        Culinaria culinaria = new Culinaria();
        culinaria.setId(4);
        culinaria.setNome("Açaís");
        culinaria.setMeioMeio(false);
        culinaria = culinariaRepository.save(culinaria);
        culinariaId = culinaria.getId();

        User user = new User();
        user.setNome("Usuario Teste");
        user.setEmail("teste@exemplo.com");
        user.setAtivo(true);
        user.setDataCriacao(LocalDateTime.now());
        user.setDataAtualizacao(LocalDateTime.now());
        user = userRepository.save(user);
        userId = user.getId();

        Organization org = new Organization();
        org.setNome("Org Teste");
        org.setSlug("org-teste");
        org.setAtiva(true);
        org.setDataCriacao(LocalDateTime.now());
        org.setDataAtualizacao(LocalDateTime.now());
        org = organizationRepository.save(org);
        organizationId = org.getId();

        Membership membership = new Membership();
        membership.setUser(user);
        membership.setOrganization(org);
        membership.setPapel(MembershipRole.OWNER);
        membership.setAtivo(true);
        membership.setDataIngresso(LocalDateTime.now());
        membershipRepository.save(membership);

        accessToken = jwtService.generateAccessToken(user);

        authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);
        authHeaders.set("X-Organization-Id", organizationId.toString());
    }

    @Nested
    @DisplayName("POST /categorias")
    class CriarCategoria {

        @Test
        @DisplayName("deve criar categoria com opcoes")
        void deveCriarCategoria() {
            CategoriaInput input = novoInputCategoria();

            HttpEntity<CategoriaInput> request = new HttpEntity<>(input, authHeaders);
            ResponseEntity<CategoriaOutput> response = restTemplate.postForEntity(
                    "/api/categorias", request, CategoriaOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getIdCategoria()).isNotNull();
            assertThat(response.getBody().getOpcoes()).hasSize(2);

            Long idCategoria = response.getBody().getIdCategoria();
            Categoria categoria = categoriaRepository.findById(idCategoria).orElseThrow();
            assertThat(categoria.getOrganizationId()).isEqualTo(organizationId);
        }

        @Test
        @DisplayName("deve retornar 400 quando faltar campo obrigatorio")
        void deveRetornar400() {
            CategoriaInput input = new CategoriaInput();

            HttpEntity<CategoriaInput> request = new HttpEntity<>(input, authHeaders);
            ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                    "/api/categorias", request, ProblemDetail.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTitle()).isEqualTo("Campos invalidos.");
        }
    }

    @Nested
    @DisplayName("GET /categorias")
    class ListarCategorias {

        @Test
        @DisplayName("deve listar categorias existentes")
        void deveListarCategorias() {
            Categoria categoria = criarCategoriaNoBanco("Açaís", List.of("300ml"));

            ResponseEntity<CategoriaOutput[]> response = restTemplate.exchange(
                    "/api/categorias",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    CategoriaOutput[].class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            assertThat(response.getBody()[0].getNome()).isEqualTo(categoria.getNome());
        }
    }

    @Nested
    @DisplayName("POST /categorias/{id}/opcoes")
    class OpcoesCategoria {

        @Test
        @DisplayName("deve adicionar nova opcao a categoria")
        void deveAdicionarOpcao() {
            Categoria categoria = criarCategoriaNoBanco("Açaís", List.of("300ml"));

            CategoriaOpcaoInput input = new CategoriaOpcaoInput();
            input.setNome("500ml");

            HttpEntity<CategoriaOpcaoInput> request = new HttpEntity<>(input, authHeaders);
            ResponseEntity<CategoriaOpcaoOutput> response = restTemplate.postForEntity(
                    "/api/categorias/" + categoria.getId() + "/opcoes",
                    request,
                    CategoriaOpcaoOutput.class);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getNome()).isEqualTo("500ml");
        }
    }

    private CategoriaInput novoInputCategoria() {
        CategoriaInput input = new CategoriaInput();
        input.setIdCulinaria(culinariaId);
        input.setNome("Açaís");
        input.setDescricao("Categoria de açaís");
        input.setOpcaoMeia("");
        input.setOpcoes(List.of("300ml", "500ml"));
        input.setOrdem(1);

        CategoriaDisponibilidadeDto disp = new CategoriaDisponibilidadeDto();
        disp.setDomingo(false);
        disp.setSegunda(true);
        disp.setTerca(true);
        disp.setQuarta(true);
        disp.setQuinta(true);
        disp.setSexta(true);
        disp.setSabado(true);
        input.setDisponivel(disp);

        input.setInicio("00:00");
        input.setFim("23:00");

        return input;
    }

    private Categoria criarCategoriaNoBanco(String nome, List<String> opcoes) {
        Categoria categoria = new Categoria();
        categoria.setOrganizationId(organizationId);
        categoria.setCulinariaId(culinariaId);
        categoria.setNome(nome);
        categoria.setDescricao("Descricao");
        categoria.setOrdem(1);
        categoria.setAtivo(true);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria.setCriadoPor(userId);
        categoria.setDisponivelDomingo(false);
        categoria.setDisponivelSegunda(true);
        categoria.setDisponivelTerca(true);
        categoria.setDisponivelQuarta(true);
        categoria.setDisponivelQuinta(true);
        categoria.setDisponivelSexta(true);
        categoria.setDisponivelSabado(true);

        categoria.setOpcoes(opcoes.stream().map(nomeOpcao -> {
            br.com.exemplo.todo.domain.model.entity.CategoriaOpcao opcao =
                    new br.com.exemplo.todo.domain.model.entity.CategoriaOpcao();
            opcao.setCategoria(categoria);
            opcao.setNome(nomeOpcao);
            opcao.setAtivo(true);
            return opcao;
        }).toList());

        return categoriaRepository.save(categoria);
    }
}
