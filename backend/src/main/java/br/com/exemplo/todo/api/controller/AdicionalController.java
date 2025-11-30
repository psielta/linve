package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.adicional.AdicionalInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalItemOutput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOutput;
import br.com.exemplo.todo.api.openapi.AdicionalControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Adicional;
import br.com.exemplo.todo.domain.model.entity.AdicionalItem;
import br.com.exemplo.todo.domain.service.AdicionalService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/adicionais", produces = {APPLICATION_JSON_VALUE, "application/problem+json"})
@PreAuthorize("@tenantSecurity.isMember()")
public class AdicionalController implements AdicionalControllerOpenApi {

    private final AdicionalService adicionalService;

    @Override
    @GetMapping
    public List<AdicionalOutput> listar(@RequestParam(name = "id_categoria", required = false) Long idCategoria) {
        log.debug("GET /adicionais - id_categoria={}", idCategoria);
        return adicionalService.listar(idCategoria).stream().map(this::toOutput).toList();
    }

    @Override
    @GetMapping("/{id}")
    public AdicionalOutput buscar(@PathVariable Long id) {
        log.debug("GET /adicionais/{}", id);
        return toOutput(adicionalService.buscar(id));
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdicionalOutput criar(@RequestBody @Valid AdicionalInput input) {
        log.debug("POST /adicionais - nome={}", input.getNome());
        return toOutput(adicionalService.criar(input));
    }

    @Override
    @PutMapping("/{id}")
    public AdicionalOutput atualizar(@PathVariable Long id, @RequestBody @Valid AdicionalInput input) {
        log.debug("PUT /adicionais/{} - nome={}", id, input.getNome());
        return toOutput(adicionalService.atualizar(id, input));
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /adicionais/{}", id);
        adicionalService.excluir(id);
    }

    private AdicionalOutput toOutput(Adicional adicional) {
        AdicionalOutput out = new AdicionalOutput();
        out.setIdAdicional(adicional.getId());
        out.setIdCategoria(adicional.getCategoriaId());
        out.setNome(adicional.getNome());
        out.setSelecao(adicional.getSelecao().name());
        out.setMinimo(adicional.getMinimo());
        out.setLimite(adicional.getLimite());
        out.setStatus(adicional.getAtivo());
        if (adicional.getItens() != null) {
            List<AdicionalItemOutput> itens = adicional.getItens().stream()
                    .filter(i -> Boolean.TRUE.equals(i.getAtivo()))
                    .map(this::toItemOutput)
                    .toList();
            out.setOpcoes(itens);
        }
        return out;
    }

    private AdicionalItemOutput toItemOutput(AdicionalItem item) {
        AdicionalItemOutput out = new AdicionalItemOutput();
        out.setIdItem(item.getId());
        out.setNome(item.getNome());
        out.setValor(item.getValor());
        out.setStatus(item.getAtivo());
        return out;
    }
}

