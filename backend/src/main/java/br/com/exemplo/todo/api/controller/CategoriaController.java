package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.categoria.CategoriaDisponibilidadeDto;
import br.com.exemplo.todo.api.dto.categoria.CategoriaInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoOutput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOutput;
import br.com.exemplo.todo.api.openapi.CategoriaControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.service.CategoriaService;
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

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/categorias", produces = {"application/json", "application/problem+json"})
@PreAuthorize("@tenantSecurity.isMember()")
public class CategoriaController implements CategoriaControllerOpenApi {

    private final CategoriaService categoriaService;

    @Override
    @GetMapping
    public List<CategoriaOutput> listar(@RequestParam(name = "id_culinaria", required = false) Integer idCulinaria) {
        log.debug("GET /categorias - id_culinaria={}", idCulinaria);
        List<Categoria> categorias = categoriaService.listar(idCulinaria);
        return categorias.stream()
                .map(this::toOutput)
                .toList();
    }

    @Override
    @GetMapping("/{id}")
    public CategoriaOutput buscar(@PathVariable Long id) {
        log.debug("GET /categorias/{}", id);
        Categoria categoria = categoriaService.buscarPorId(id);
        return toOutput(categoria);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaOutput criar(@RequestBody @Valid CategoriaInput input) {
        log.debug("POST /categorias - nome={}", input.getNome());
        Categoria categoria = categoriaService.criar(input);
        return toOutput(categoria);
    }

    @Override
    @PutMapping("/{id}")
    public CategoriaOutput atualizar(@PathVariable Long id, @RequestBody @Valid CategoriaInput input) {
        log.debug("PUT /categorias/{} - nome={}", id, input.getNome());
        Categoria categoria = categoriaService.atualizar(id, input);
        return toOutput(categoria);
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /categorias/{}", id);
        categoriaService.excluir(id);
    }

    @Override
    @GetMapping("/{idCategoria}/opcoes")
    public List<CategoriaOpcaoOutput> listarOpcoes(@PathVariable Long idCategoria) {
        log.debug("GET /categorias/{}/opcoes", idCategoria);
        return categoriaService.listarOpcoes(idCategoria).stream()
                .map(this::toOpcaoOutput)
                .toList();
    }

    @Override
    @PostMapping("/{idCategoria}/opcoes")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaOpcaoOutput adicionarOpcao(@PathVariable Long idCategoria,
                                               @RequestBody @Valid CategoriaOpcaoInput input) {
        log.debug("POST /categorias/{}/opcoes - nome={}", idCategoria, input.getNome());
        CategoriaOpcao opcao = categoriaService.adicionarOpcao(idCategoria, input);
        return toOpcaoOutput(opcao);
    }

    @Override
    @PutMapping("/{idCategoria}/opcoes/{idOpcao}")
    public CategoriaOpcaoOutput atualizarOpcao(@PathVariable Long idCategoria,
                                               @PathVariable Long idOpcao,
                                               @RequestBody @Valid CategoriaOpcaoInput input) {
        log.debug("PUT /categorias/{}/opcoes/{} - nome={}", idCategoria, idOpcao, input.getNome());
        CategoriaOpcao opcao = categoriaService.atualizarOpcao(idCategoria, idOpcao, input);
        return toOpcaoOutput(opcao);
    }

    @Override
    @DeleteMapping("/{idCategoria}/opcoes/{idOpcao}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativarOpcao(@PathVariable Long idCategoria, @PathVariable Long idOpcao) {
        log.debug("DELETE /categorias/{}/opcoes/{}", idCategoria, idOpcao);
        categoriaService.desativarOpcao(idCategoria, idOpcao);
    }

    private CategoriaOutput toOutput(Categoria categoria) {
        CategoriaOutput output = new CategoriaOutput();
        output.setIdCategoria(categoria.getId());
        output.setIdCulinaria(categoria.getCulinariaId());
        output.setOrdem(categoria.getOrdem());
        output.setNome(categoria.getNome());
        output.setDescricao(categoria.getDescricao());
        output.setInicio(categoria.getInicio());
        output.setFim(categoria.getFim());
        output.setAtivo(categoria.getAtivo());
        output.setOpcaoMeia(categoria.getOpcaoMeia());

        CategoriaDisponibilidadeDto disp = new CategoriaDisponibilidadeDto();
        disp.setDomingo(categoria.getDisponivelDomingo());
        disp.setSegunda(categoria.getDisponivelSegunda());
        disp.setTerca(categoria.getDisponivelTerca());
        disp.setQuarta(categoria.getDisponivelQuarta());
        disp.setQuinta(categoria.getDisponivelQuinta());
        disp.setSexta(categoria.getDisponivelSexta());
        disp.setSabado(categoria.getDisponivelSabado());
        output.setDisponivel(disp);

        if (categoria.getOpcoes() != null) {
            List<CategoriaOpcaoOutput> opcoes = categoria.getOpcoes().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getAtivo()))
                    .map(this::toOpcaoOutput)
                    .toList();
            output.setOpcoes(opcoes);
        }

        return output;
    }

    private CategoriaOpcaoOutput toOpcaoOutput(CategoriaOpcao opcao) {
        CategoriaOpcaoOutput output = new CategoriaOpcaoOutput();
        output.setIdOpcao(opcao.getId());
        if (opcao.getCategoria() != null) {
            output.setIdCategoria(opcao.getCategoria().getId());
        }
        output.setNome(opcao.getNome());
        output.setAtivo(opcao.getAtivo());
        return output;
    }
}

