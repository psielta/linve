package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.api.dto.produto.ProdutoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOpcaoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOutput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.model.entity.Membership;
import br.com.exemplo.todo.domain.model.entity.Organization;
import br.com.exemplo.todo.domain.model.entity.User;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.CategoriaOpcaoRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.repository.MembershipRepository;
import br.com.exemplo.todo.domain.repository.OrganizationRepository;
import br.com.exemplo.todo.domain.repository.ProdutoRepository;
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
@DisplayName("ProdutoController - Testes de Integracao")
class ProdutoControllerIntegracaoTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private CategoriaOpcaoRepository categoriaOpcaoRepository;

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
    private Long opcao1Id;
    private Long opcao2Id;

    @BeforeEach
    void setUp() {
        produtoRepository.deleteAll();
        membershipRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();
        categoriaOpcaoRepository.deleteAll();
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
        categoria.setId(null);
        categoria.setNome("Acaís");
        categoria.setDescricao("Categoria test");
        categoria.setAtivo(true);
        categoria.setCulinariaId(4);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria = categoriaRepository.save(categoria);
        categoriaId = categoria.getId();

        CategoriaOpcao opc1 = new CategoriaOpcao();
        opc1.setCategoria(categoria);
        opc1.setNome("500ml");
        opc1.setAtivo(true);
        opc1 = categoriaOpcaoRepository.save(opc1);
        opcao1Id = opc1.getId();

        CategoriaOpcao opc2 = new CategoriaOpcao();
        opc2.setCategoria(categoria);
        opc2.setNome("700ml");
        opc2.setAtivo(true);
        opc2 = categoriaOpcaoRepository.save(opc2);
        opcao2Id = opc2.getId();

        String token = jwtService.generateAccessToken(user);

        authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(token);
        authHeaders.set("X-Organization-Id", org.getId().toString());
    }

    @Nested
    @DisplayName("POST /produtos")
    class CriarProduto {
        @Test
        @DisplayName("deve criar produto com precos validos")
        void deveCriarProduto() {
            ProdutoInput input = novoInputValido();

            HttpEntity<ProdutoInput> request = new HttpEntity<>(input, authHeaders);
            ResponseEntity<ProdutoOutput> response = restTemplate.postForEntity(
                    "/api/produtos",
                    request,
                    ProdutoOutput.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOpcoes()).hasSize(2);
        }

        @Test
        @DisplayName("deve retornar 400 quando opcao nao pertence a categoria")
        void deveRetornar400OpcaoErrada() {
            ProdutoInput input = novoInputValido();
            input.getOpcoes().get(0).setId_opcao(999L); // opcao inexistente

            HttpEntity<ProdutoInput> request = new HttpEntity<>(input, authHeaders);
            ResponseEntity<ProblemDetail> response = restTemplate.postForEntity(
                    "/api/produtos",
                    request,
                    ProblemDetail.class
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    private ProdutoInput novoInputValido() {
        ProdutoOpcaoInput p1 = new ProdutoOpcaoInput();
        p1.setId_opcao(opcao1Id);
        p1.setValor(BigDecimal.valueOf(20));

        ProdutoOpcaoInput p2 = new ProdutoOpcaoInput();
        p2.setId_opcao(opcao2Id);
        p2.setValor(BigDecimal.valueOf(30));

        ProdutoInput input = new ProdutoInput();
        input.setId_categoria(categoriaId);
        input.setNome("Açaí Copo");
        input.setDescricao("Teste");
        input.setOpcoes(List.of(p1, p2));
        return input;
    }
}

