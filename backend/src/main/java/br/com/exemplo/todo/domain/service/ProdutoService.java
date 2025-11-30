package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.produto.ProdutoInput;
import br.com.exemplo.todo.api.dto.produto.ProdutoOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.model.entity.Produto;
import br.com.exemplo.todo.domain.model.entity.ProdutoPreco;
import br.com.exemplo.todo.domain.repository.CategoriaOpcaoRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.repository.ProdutoPrecoRepository;
import br.com.exemplo.todo.domain.repository.ProdutoRepository;
import br.com.exemplo.todo.domain.service.exception.ProdutoNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.ProdutoPrecoCategoriaInvalidaException;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoPrecoRepository produtoPrecoRepository;
    private final CategoriaRepository categoriaRepository;
    private final CategoriaOpcaoRepository categoriaOpcaoRepository;

    @Transactional(readOnly = true)
    public List<Produto> listar(Long categoriaId) {
        Long orgId = TenantContext.getOrganizationId();
        if (categoriaId != null) {
            return produtoRepository.findByOrganizationIdAndCategoriaIdAndAtivoTrueOrderByNomeAsc(orgId, categoriaId);
        }
        return produtoRepository.findByOrganizationIdAndAtivoTrueOrderByNomeAsc(orgId);
    }

    @Transactional(readOnly = true)
    public Produto buscar(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        return produtoRepository.findByIdAndOrganizationIdAndAtivoTrue(id, orgId)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }

    @Transactional
    public Produto criar(ProdutoInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long userId = TenantContext.getUserId();

        Categoria categoria = validarCategoria(orgId, input.getId_categoria());
        Map<Long, CategoriaOpcao> opcoesValidas = validarOpcoes(categoria, input.getOpcoes());

        Produto produto = new Produto();
        produto.setOrganizationId(orgId);
        produto.setCategoriaId(categoria.getId());
        produto.setNome(input.getNome());
        produto.setDescricao(input.getDescricao());
        produto.setAtivo(true);
        produto.setCriadoPor(userId);
        produto.setDataCriacao(LocalDateTime.now());

        for (ProdutoOpcaoInput opc : input.getOpcoes()) {
            ProdutoPreco preco = new ProdutoPreco();
            preco.setOrganizationId(orgId);
            preco.setProduto(produto);
            preco.setCategoriaOpcaoId(opc.getId_opcao());
            preco.setValor(opc.getValor());
            preco.setAtivo(true);
            preco.setDataCriacao(LocalDateTime.now());
            produto.getPrecos().add(preco);
        }

        Produto salvo = produtoRepository.save(produto);
        log.info("Produto criado id={} org={}", salvo.getId(), orgId);
        return salvo;
    }

    @Transactional
    public Produto atualizar(Long id, ProdutoInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Produto existente = buscar(id);

        Categoria categoria = validarCategoria(orgId, input.getId_categoria());
        Map<Long, CategoriaOpcao> opcoesValidas = validarOpcoes(categoria, input.getOpcoes());

        existente.setCategoriaId(categoria.getId());
        existente.setNome(input.getNome());
        existente.setDescricao(input.getDescricao());
        existente.setDataAtualizacao(LocalDateTime.now());

        sincronizarPrecos(existente, input.getOpcoes());

        Produto atualizado = produtoRepository.save(existente);
        log.info("Produto atualizado id={} org={}", atualizado.getId(), orgId);
        return atualizado;
    }

    @Transactional
    public void excluir(Long id) {
        Produto produto = buscar(id);
        produto.setAtivo(false);
        produto.setDataAtualizacao(LocalDateTime.now());
        if (produto.getPrecos() != null) {
            produto.getPrecos().forEach(p -> {
                p.setAtivo(false);
                p.setDataAtualizacao(LocalDateTime.now());
            });
        }
        produtoRepository.save(produto);
        log.info("Produto desativado id={}", id);
    }

    private Categoria validarCategoria(Long orgId, Long categoriaId) {
        return categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoriaId, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria invalida ou inativa"));
    }

    private Map<Long, CategoriaOpcao> validarOpcoes(Categoria categoria, List<ProdutoOpcaoInput> opcoes) {
        Map<Long, CategoriaOpcao> mapa = new HashMap<>();
        for (ProdutoOpcaoInput opcao : opcoes) {
            Long idOpcao = opcao.getId_opcao();
            Optional<CategoriaOpcao> co = categoria.getOpcoes().stream()
                    .filter(o -> o.getId().equals(idOpcao) && Boolean.TRUE.equals(o.getAtivo()))
                    .findFirst();
            if (co.isEmpty()) {
                throw new ProdutoPrecoCategoriaInvalidaException();
            }
            mapa.put(idOpcao, co.get());

            if (opcao.getValor() == null || opcao.getValor().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("valor deve ser maior que zero");
            }
        }
        return mapa;
    }

    private void sincronizarPrecos(Produto produto, List<ProdutoOpcaoInput> novasOpcoes) {
        Map<Long, ProdutoPreco> atuaisPorOpcao = new HashMap<>();
        if (produto.getPrecos() != null) {
            produto.getPrecos().forEach(p -> atuaisPorOpcao.put(p.getCategoriaOpcaoId(), p));
        }

        // Desativar os que saíram
        for (ProdutoPreco atual : atuaisPorOpcao.values()) {
            boolean permanece = novasOpcoes.stream().anyMatch(o -> o.getId_opcao().equals(atual.getCategoriaOpcaoId()));
            if (!permanece && Boolean.TRUE.equals(atual.getAtivo())) {
                atual.setAtivo(false);
                atual.setDataAtualizacao(LocalDateTime.now());
            }
        }

        // Adicionar ou atualizar
        for (ProdutoOpcaoInput nova : novasOpcoes) {
            ProdutoPreco existente = atuaisPorOpcao.get(nova.getId_opcao());
            if (existente != null) {
                existente.setValor(nova.getValor());
                existente.setAtivo(true);
                existente.setDataAtualizacao(LocalDateTime.now());
            } else {
                ProdutoPreco preco = new ProdutoPreco();
                preco.setOrganizationId(produto.getOrganizationId());
                preco.setProduto(produto);
                preco.setCategoriaOpcaoId(nova.getId_opcao());
                preco.setValor(nova.getValor());
                preco.setAtivo(true);
                preco.setDataCriacao(LocalDateTime.now());
                produto.getPrecos().add(preco);
            }
        }
    }
}

