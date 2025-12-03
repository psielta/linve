package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.cliente.ClienteEnderecoOutput;
import br.com.exemplo.todo.api.dto.cliente.ClienteInput;
import br.com.exemplo.todo.api.dto.cliente.ClienteOutput;
import br.com.exemplo.todo.api.openapi.ClienteControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Cliente;
import br.com.exemplo.todo.domain.model.entity.ClienteEndereco;
import br.com.exemplo.todo.domain.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/clientes", produces = {"application/json", "application/problem+json"})
@PreAuthorize("@tenantSecurity.isMember()")
public class ClienteController implements ClienteControllerOpenApi {

    private final ClienteService clienteService;

    @Override
    @GetMapping
    public List<ClienteOutput> listar() {
        log.debug("GET /clientes");
        List<Cliente> clientes = clienteService.listar();
        return clientes.stream()
                .map(this::toOutput)
                .toList();
    }

    @Override
    @GetMapping("/{id}")
    public ClienteOutput buscar(@PathVariable Long id) {
        log.debug("GET /clientes/{}", id);
        Cliente cliente = clienteService.buscar(id);
        return toOutput(cliente);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteOutput criar(@RequestBody @Valid ClienteInput input) {
        log.debug("POST /clientes - nome={}", input.getNome());
        Cliente cliente = clienteService.criar(input);
        return toOutput(cliente);
    }

    @Override
    @PutMapping("/{id}")
    public ClienteOutput atualizar(@PathVariable Long id, @RequestBody @Valid ClienteInput input) {
        log.debug("PUT /clientes/{} - nome={}", id, input.getNome());
        Cliente cliente = clienteService.atualizar(id, input);
        return toOutput(cliente);
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /clientes/{}", id);
        clienteService.excluir(id);
    }

    private ClienteOutput toOutput(Cliente cliente) {
        ClienteOutput output = new ClienteOutput();
        output.setId(cliente.getId());
        output.setNome(cliente.getNome());
        output.setTel1(cliente.getTel1());
        output.setTel2(cliente.getTel2());
        output.setTel3(cliente.getTel3());
        output.setDocumento(cliente.getDocumento());

        if (cliente.getEnderecos() != null) {
            List<ClienteEnderecoOutput> enderecos = cliente.getEnderecos().stream()
                    .filter(e -> Boolean.TRUE.equals(e.getAtivo()))
                    .map(this::toEnderecoOutput)
                    .toList();
            output.setEnderecos(enderecos);
        }

        return output;
    }

    private ClienteEnderecoOutput toEnderecoOutput(ClienteEndereco endereco) {
        ClienteEnderecoOutput output = new ClienteEnderecoOutput();
        output.setId(endereco.getId());
        output.setCep(endereco.getCep());
        output.setBairro(endereco.getBairro());
        output.setRua(endereco.getRua());
        output.setNum(endereco.getNum());
        output.setComplemento(endereco.getComplemento());
        output.setPontoReferencia(endereco.getPontoReferencia());

        if (endereco.getMunicipio() != null) {
            output.setMunicipio(endereco.getMunicipio().getCodigo());
            output.setCidade(endereco.getMunicipio().getNome());
            if (endereco.getMunicipio().getUf() != null) {
                output.setUf(endereco.getMunicipio().getUf().getSigla());
            }
        }

        return output;
    }
}
