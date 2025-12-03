package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.cliente.ClienteEnderecoInput;
import br.com.exemplo.todo.api.dto.cliente.ClienteInput;
import br.com.exemplo.todo.domain.model.entity.Cliente;
import br.com.exemplo.todo.domain.model.entity.ClienteEndereco;
import br.com.exemplo.todo.domain.model.entity.Municipio;
import br.com.exemplo.todo.domain.repository.ClienteEnderecoRepository;
import br.com.exemplo.todo.domain.repository.ClienteRepository;
import br.com.exemplo.todo.domain.repository.MunicipioRepository;
import br.com.exemplo.todo.domain.service.exception.ClienteNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.DocumentoInvalidoException;
import br.com.exemplo.todo.domain.service.exception.DocumentoJaCadastradoException;
import br.com.exemplo.todo.domain.service.exception.MunicipioNaoEncontradoException;
import br.com.exemplo.todo.domain.validation.DocumentoValidator;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteEnderecoRepository enderecoRepository;
    private final MunicipioRepository municipioRepository;

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Listando clientes da organizacao {}", orgId);
        return clienteRepository.findByOrganizationIdAndAtivoTrueOrderByNomeAsc(orgId);
    }

    @Transactional(readOnly = true)
    public Cliente buscar(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Buscando cliente {} na organizacao {}", id, orgId);
        return clienteRepository.findByIdAndOrganizationIdAndAtivoTrue(id, orgId)
                .orElseThrow(() -> new ClienteNaoEncontradoException(id));
    }

    @Transactional
    public Cliente criar(ClienteInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long userId = TenantContext.getUserId();
        log.debug("Criando cliente na organizacao {} com nome {}", orgId, input.getNome());

        validarDocumento(input.getDocumento(), null, orgId);

        Cliente cliente = new Cliente();
        cliente.setOrganizationId(orgId);
        cliente.setNome(input.getNome());
        cliente.setTel1(input.getTel1());
        cliente.setTel2(input.getTel2());
        cliente.setTel3(input.getTel3());
        cliente.setDocumento(DocumentoValidator.limpar(input.getDocumento()));
        cliente.setAtivo(true);
        cliente.setDataCriacao(LocalDateTime.now());
        cliente.setCriadoPor(userId);

        List<ClienteEndereco> enderecos = criarEnderecos(input.getEnderecos(), cliente, orgId);
        cliente.setEnderecos(enderecos);

        Cliente salvo = clienteRepository.save(cliente);
        log.info("Cliente criado com ID {} na organizacao {}", salvo.getId(), orgId);

        return salvo;
    }

    @Transactional
    public Cliente atualizar(Long id, ClienteInput input) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Atualizando cliente {} na organizacao {}", id, orgId);

        Cliente existente = buscar(id);

        validarDocumento(input.getDocumento(), existente.getId(), orgId);

        existente.setNome(input.getNome());
        existente.setTel1(input.getTel1());
        existente.setTel2(input.getTel2());
        existente.setTel3(input.getTel3());
        existente.setDocumento(DocumentoValidator.limpar(input.getDocumento()));
        existente.setDataAtualizacao(LocalDateTime.now());

        sincronizarEnderecos(existente, input.getEnderecos(), orgId);

        Cliente atualizado = clienteRepository.save(existente);
        log.info("Cliente {} atualizado na organizacao {}", id, orgId);

        return atualizado;
    }

    @Transactional
    public void excluir(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Desativando (soft delete) cliente {} na organizacao {}", id, orgId);

        Cliente cliente = buscar(id);
        cliente.setAtivo(false);
        cliente.setDataAtualizacao(LocalDateTime.now());

        // Soft delete dos enderecos
        if (cliente.getEnderecos() != null) {
            cliente.getEnderecos().forEach(endereco -> {
                endereco.setAtivo(false);
                endereco.setDataAtualizacao(LocalDateTime.now());
            });
        }

        clienteRepository.save(cliente);
        log.info("Cliente {} desativado na organizacao {}", id, orgId);
    }

    private void validarDocumento(String documento, Long clienteIdExistente, Long orgId) {
        if (documento == null || documento.isBlank()) {
            return;
        }

        String docLimpo = DocumentoValidator.limpar(documento);

        if (!DocumentoValidator.isValid(docLimpo)) {
            throw new DocumentoInvalidoException(documento);
        }

        boolean existe;
        if (clienteIdExistente == null) {
            existe = clienteRepository.existsByDocumentoAndOrganizationIdAndAtivoTrue(docLimpo, orgId);
        } else {
            existe = clienteRepository.existsByDocumentoAndOrganizationIdAndIdNotAndAtivoTrue(docLimpo, orgId, clienteIdExistente);
        }

        if (existe) {
            throw new DocumentoJaCadastradoException(documento, DocumentoValidator.isCpf(docLimpo));
        }
    }

    private List<ClienteEndereco> criarEnderecos(List<ClienteEnderecoInput> inputs, Cliente cliente, Long orgId) {
        List<ClienteEndereco> enderecos = new ArrayList<>();

        for (ClienteEnderecoInput input : inputs) {
            Municipio municipio = buscarMunicipio(input.getMunicipioId());

            ClienteEndereco endereco = new ClienteEndereco();
            endereco.setCliente(cliente);
            endereco.setOrganizationId(orgId);
            endereco.setMunicipio(municipio);
            endereco.setCep(input.getCep());
            endereco.setBairro(input.getBairro());
            endereco.setRua(input.getRua());
            endereco.setNum(input.getNum());
            endereco.setComplemento(input.getComplemento());
            endereco.setPontoReferencia(input.getPontoReferencia());
            endereco.setAtivo(true);
            endereco.setDataCriacao(LocalDateTime.now());

            enderecos.add(endereco);
        }

        return enderecos;
    }

    private void sincronizarEnderecos(Cliente cliente, List<ClienteEnderecoInput> inputs, Long orgId) {
        if (cliente.getEnderecos() == null) {
            cliente.setEnderecos(new ArrayList<>());
        }

        Set<Long> idsEnviados = new HashSet<>();
        for (ClienteEnderecoInput input : inputs) {
            if (input.getId() != null) {
                idsEnviados.add(input.getId());
            }
        }

        // Soft delete enderecos nao enviados
        for (ClienteEndereco existente : cliente.getEnderecos()) {
            if (Boolean.TRUE.equals(existente.getAtivo()) && !idsEnviados.contains(existente.getId())) {
                existente.setAtivo(false);
                existente.setDataAtualizacao(LocalDateTime.now());
            }
        }

        // Atualizar ou criar enderecos
        for (ClienteEnderecoInput input : inputs) {
            if (input.getId() != null) {
                // Atualizar existente
                ClienteEndereco existente = cliente.getEnderecos().stream()
                        .filter(e -> e.getId().equals(input.getId()))
                        .findFirst()
                        .orElse(null);

                if (existente != null) {
                    Municipio municipio = buscarMunicipio(input.getMunicipioId());
                    existente.setMunicipio(municipio);
                    existente.setCep(input.getCep());
                    existente.setBairro(input.getBairro());
                    existente.setRua(input.getRua());
                    existente.setNum(input.getNum());
                    existente.setComplemento(input.getComplemento());
                    existente.setPontoReferencia(input.getPontoReferencia());
                    existente.setAtivo(true);
                    existente.setDataAtualizacao(LocalDateTime.now());
                }
            } else {
                // Criar novo
                Municipio municipio = buscarMunicipio(input.getMunicipioId());

                ClienteEndereco novo = new ClienteEndereco();
                novo.setCliente(cliente);
                novo.setOrganizationId(orgId);
                novo.setMunicipio(municipio);
                novo.setCep(input.getCep());
                novo.setBairro(input.getBairro());
                novo.setRua(input.getRua());
                novo.setNum(input.getNum());
                novo.setComplemento(input.getComplemento());
                novo.setPontoReferencia(input.getPontoReferencia());
                novo.setAtivo(true);
                novo.setDataCriacao(LocalDateTime.now());

                cliente.getEnderecos().add(novo);
            }
        }
    }

    private Municipio buscarMunicipio(Long codigoIbge) {
        return municipioRepository.findById(codigoIbge)
                .orElseThrow(() -> new MunicipioNaoEncontradoException(codigoIbge));
    }
}
