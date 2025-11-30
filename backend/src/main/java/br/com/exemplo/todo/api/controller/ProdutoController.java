package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.produto.ProdutoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOutput;
import br.com.exemplo.todo.api.dto.produto.ProdutoPrecoOutput;
import br.com.exemplo.todo.api.openapi.ProdutoControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Produto;
import br.com.exemplo.todo.domain.model.entity.ProdutoPreco;
import br.com.exemplo.todo.domain.repository.CategoriaOpcaoRepository;
import br.com.exemplo.todo.domain.service.ProdutoService;
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

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/produtos", produces = {APPLICATION_JSON_VALUE, "application/problem+json"})
@PreAuthorize("@tenantSecurity.isMember()")
public class ProdutoController implements ProdutoControllerOpenApi {

    private final ProdutoService produtoService;
    private final CategoriaOpcaoRepository categoriaOpcaoRepository;

    @Override
    @GetMapping
    public List<ProdutoOutput> listar(@RequestParam(name = "id_categoria", required = false) Long idCategoria) {
        log.debug("GET /produtos - id_categoria={}", idCategoria);
        List<Produto> produtos = produtoService.listar(idCategoria);
        return produtos.stream().map(this::toOutput).toList();
    }

    @Override
    @GetMapping("/{id}")
    public ProdutoOutput buscar(@PathVariable Long id) {
        log.debug("GET /produtos/{}", id);
        Produto produto = produtoService.buscar(id);
        return toOutput(produto);
    }

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoOutput criar(@RequestBody @Valid ProdutoInput input) {
        log.debug("POST /produtos - nome={}", input.getNome());
        Produto produto = produtoService.criar(input);
        return toOutput(produto);
    }

    @Override
    @PutMapping("/{id}")
    public ProdutoOutput atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoInput input) {
        log.debug("PUT /produtos/{} - nome={}", id, input.getNome());
        Produto produto = produtoService.atualizar(id, input);
        return toOutput(produto);
    }

    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        log.debug("DELETE /produtos/{}", id);
        produtoService.excluir(id);
    }

    private ProdutoOutput toOutput(Produto produto) {
        ProdutoOutput output = new ProdutoOutput();
        output.setId_produto(produto.getId());
        output.setId_categoria(produto.getCategoriaId());
        output.setNome(produto.getNome());
        output.setDescricao(produto.getDescricao());
        output.setStatus(produto.getAtivo());

        if (produto.getPrecos() != null) {
            List<ProdutoPrecoOutput> precos = produto.getPrecos().stream()
                    .filter(p -> Boolean.TRUE.equals(p.getAtivo()))
                    .map(this::toPrecoOutput)
                    .toList();
            output.setOpcoes(precos);
        }
        return output;
    }

    private ProdutoPrecoOutput toPrecoOutput(ProdutoPreco preco) {
        ProdutoPrecoOutput out = new ProdutoPrecoOutput();
        out.setId_preco(preco.getId());
        out.setId_opcao(preco.getCategoriaOpcaoId());
        out.setValor(preco.getValor());
        out.setStatus(preco.getAtivo());

        categoriaOpcaoRepository.findById(preco.getCategoriaOpcaoId())
                .ifPresent(co -> out.setNome(co.getNome()));
        return out;
    }
}

