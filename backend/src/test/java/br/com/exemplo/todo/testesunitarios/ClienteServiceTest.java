package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.api.dto.cliente.ClienteEnderecoInput;
import br.com.exemplo.todo.api.dto.cliente.ClienteInput;
import br.com.exemplo.todo.domain.model.entity.Cliente;
import br.com.exemplo.todo.domain.model.entity.ClienteEndereco;
import br.com.exemplo.todo.domain.model.entity.Municipio;
import br.com.exemplo.todo.domain.model.entity.Uf;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.repository.ClienteEnderecoRepository;
import br.com.exemplo.todo.domain.repository.ClienteRepository;
import br.com.exemplo.todo.domain.repository.MunicipioRepository;
import br.com.exemplo.todo.domain.service.ClienteService;
import br.com.exemplo.todo.domain.service.exception.ClienteNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.DocumentoInvalidoException;
import br.com.exemplo.todo.domain.service.exception.DocumentoJaCadastradoException;
import br.com.exemplo.todo.domain.service.exception.MunicipioNaoEncontradoException;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClienteService")
class ClienteServiceTest {

    private static final Long ORG_ID = 1L;
    private static final Long USER_ID = 100L;
    private static final Long MUNICIPIO_CD = 3147907L;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ClienteEnderecoRepository enderecoRepository;

    @Mock
    private MunicipioRepository municipioRepository;

    @InjectMocks
    private ClienteService service;

    private Cliente cliente;
    private ClienteInput clienteInput;
    private Municipio municipio;
    private Uf uf;

    @BeforeEach
    void setUp() {
        TenantContext.set(ORG_ID, USER_ID, MembershipRole.MEMBER);

        uf = new Uf();
        uf.setCodigo(31L);
        uf.setSigla("MG");
        uf.setNome("MINAS GERAIS");

        municipio = new Municipio();
        municipio.setCodigo(MUNICIPIO_CD);
        municipio.setNome("Passos");
        municipio.setUf(uf);

        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setOrganizationId(ORG_ID);
        cliente.setNome("Ramon");
        cliente.setTel1("35999992334");
        cliente.setDocumento("95607770095");
        cliente.setAtivo(true);
        cliente.setDataCriacao(LocalDateTime.now());
        cliente.setCriadoPor(USER_ID);
        cliente.setEnderecos(new ArrayList<>());

        ClienteEndereco endereco = new ClienteEndereco();
        endereco.setId(1L);
        endereco.setCliente(cliente);
        endereco.setOrganizationId(ORG_ID);
        endereco.setMunicipio(municipio);
        endereco.setCep("36305060");
        endereco.setBairro("Matozinhos");
        endereco.setRua("Rua do Jatoba");
        endereco.setNum("71");
        endereco.setAtivo(true);
        endereco.setDataCriacao(LocalDateTime.now());
        cliente.getEnderecos().add(endereco);

        ClienteEnderecoInput enderecoInput = new ClienteEnderecoInput();
        enderecoInput.setMunicipioId(MUNICIPIO_CD);
        enderecoInput.setCep("36305060");
        enderecoInput.setBairro("Matozinhos");
        enderecoInput.setRua("Rua do Jatoba");
        enderecoInput.setNum("71");

        clienteInput = new ClienteInput();
        clienteInput.setNome("Ramon");
        clienteInput.setTel1("35999992334");
        clienteInput.setDocumento("95607770095");
        clienteInput.setEnderecos(List.of(enderecoInput));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("listar")
    class Listar {

        @Test
        @DisplayName("deve retornar lista de clientes ordenada por nome")
        void deveRetornarListaOrdenada() {
            when(clienteRepository.findByOrganizationIdAndAtivoTrueOrderByNomeAsc(ORG_ID))
                    .thenReturn(List.of(cliente));

            List<Cliente> resultado = service.listar();

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getNome()).isEqualTo("Ramon");
            verify(clienteRepository).findByOrganizationIdAndAtivoTrueOrderByNomeAsc(ORG_ID);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando nao ha clientes")
        void deveRetornarListaVazia() {
            when(clienteRepository.findByOrganizationIdAndAtivoTrueOrderByNomeAsc(ORG_ID))
                    .thenReturn(List.of());

            List<Cliente> resultado = service.listar();

            assertThat(resultado).isEmpty();
        }
    }

    @Nested
    @DisplayName("buscar")
    class Buscar {

        @Test
        @DisplayName("deve retornar cliente quando ID existe")
        void deveRetornarClienteQuandoExiste() {
            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(cliente));

            Cliente resultado = service.buscar(1L);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getId()).isEqualTo(1L);
            assertThat(resultado.getNome()).isEqualTo("Ramon");
        }

        @Test
        @DisplayName("deve lancar excecao quando ID nao existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscar(999L))
                    .isInstanceOf(ClienteNaoEncontradoException.class)
                    .hasMessageContaining("999");
        }
    }

    @Nested
    @DisplayName("criar")
    class Criar {

        @Test
        @DisplayName("deve criar cliente com sucesso")
        void deveCriarComSucesso() {
            when(municipioRepository.findById(MUNICIPIO_CD)).thenReturn(Optional.of(municipio));
            when(clienteRepository.existsByDocumentoAndOrganizationIdAndAtivoTrue("95607770095", ORG_ID))
                    .thenReturn(false);
            when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> {
                Cliente c = invocation.getArgument(0);
                c.setId(1L);
                return c;
            });

            Cliente resultado = service.criar(clienteInput);

            assertThat(resultado.getId()).isEqualTo(1L);
            assertThat(resultado.getNome()).isEqualTo("Ramon");
            assertThat(resultado.getDocumento()).isEqualTo("95607770095");
            assertThat(resultado.getOrganizationId()).isEqualTo(ORG_ID);
            assertThat(resultado.getCriadoPor()).isEqualTo(USER_ID);
            assertThat(resultado.getEnderecos()).hasSize(1);
        }

        @Test
        @DisplayName("deve lancar excecao quando documento ja cadastrado")
        void deveLancarExcecaoQuandoDocumentoJaCadastrado() {
            when(clienteRepository.existsByDocumentoAndOrganizationIdAndAtivoTrue("95607770095", ORG_ID))
                    .thenReturn(true);

            assertThatThrownBy(() -> service.criar(clienteInput))
                    .isInstanceOf(DocumentoJaCadastradoException.class);
        }

        @Test
        @DisplayName("deve lancar excecao quando documento invalido")
        void deveLancarExcecaoQuandoDocumentoInvalido() {
            clienteInput.setDocumento("12345678900");

            assertThatThrownBy(() -> service.criar(clienteInput))
                    .isInstanceOf(DocumentoInvalidoException.class);
        }

        @Test
        @DisplayName("deve lancar excecao quando municipio nao encontrado")
        void deveLancarExcecaoQuandoMunicipioNaoEncontrado() {
            when(clienteRepository.existsByDocumentoAndOrganizationIdAndAtivoTrue("95607770095", ORG_ID))
                    .thenReturn(false);
            when(municipioRepository.findById(MUNICIPIO_CD)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.criar(clienteInput))
                    .isInstanceOf(MunicipioNaoEncontradoException.class);
        }
    }

    @Nested
    @DisplayName("atualizar")
    class Atualizar {

        @Test
        @DisplayName("deve atualizar cliente existente")
        void deveAtualizarComSucesso() {
            clienteInput.setNome("Ramon Silva");

            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(cliente));
            when(clienteRepository.existsByDocumentoAndOrganizationIdAndIdNotAndAtivoTrue("95607770095", ORG_ID, 1L))
                    .thenReturn(false);
            when(municipioRepository.findById(MUNICIPIO_CD)).thenReturn(Optional.of(municipio));
            when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Cliente resultado = service.atualizar(1L, clienteInput);

            assertThat(resultado.getNome()).isEqualTo("Ramon Silva");
            assertThat(resultado.getDataAtualizacao()).isNotNull();
        }

        @Test
        @DisplayName("deve lancar excecao quando cliente nao existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.atualizar(999L, clienteInput))
                    .isInstanceOf(ClienteNaoEncontradoException.class);
        }
    }

    @Nested
    @DisplayName("excluir")
    class Excluir {

        @Test
        @DisplayName("deve desativar cliente e enderecos")
        void deveExcluirComSucesso() {
            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(1L, ORG_ID))
                    .thenReturn(Optional.of(cliente));
            when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));

            service.excluir(1L);

            assertThat(cliente.getAtivo()).isFalse();
            assertThat(cliente.getDataAtualizacao()).isNotNull();
            assertThat(cliente.getEnderecos().get(0).getAtivo()).isFalse();
            verify(clienteRepository).save(cliente);
        }

        @Test
        @DisplayName("deve lancar excecao quando cliente nao existe")
        void deveLancarExcecaoQuandoNaoExiste() {
            when(clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(999L, ORG_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.excluir(999L))
                    .isInstanceOf(ClienteNaoEncontradoException.class);
        }
    }
}
