package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.adicional.AdicionalInput;
import br.com.exemplo.todo.api.dto.adicional.AdicionalOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Adicional;
import br.com.exemplo.todo.domain.model.entity.AdicionalItem;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import br.com.exemplo.todo.domain.model.enums.SelecaoAdicional;
import br.com.exemplo.todo.domain.repository.AdicionalItemRepository;
import br.com.exemplo.todo.domain.repository.AdicionalRepository;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.exception.AdicionalNaoEncontradoException;
import br.com.exemplo.todo.domain.service.exception.AdicionalSelecaoInvalidaException;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdicionalService {

    private final AdicionalRepository adicionalRepository;
    private final AdicionalItemRepository adicionalItemRepository;
    private final CategoriaRepository categoriaRepository;

    public List<Adicional> listar(Long idCategoria) {
        Long orgId = TenantContext.getOrganizationId();
        if (idCategoria != null) {
            return adicionalRepository.findByOrganizationIdAndCategoriaIdAndAtivoTrueOrderByNomeAsc(orgId, idCategoria);
        }
        return adicionalRepository.findByOrganizationIdAndAtivoTrueOrderByNomeAsc(orgId);
    }

    public Adicional buscar(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        return adicionalRepository.findByIdAndOrganizationIdAndAtivoTrue(id, orgId)
                .orElseThrow(AdicionalNaoEncontradoException::new);
    }

    @Transactional
    public Adicional criar(AdicionalInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long userId = TenantContext.getUserId();
        Categoria categoria = validarCategoria(orgId, input.getIdCategoria());

        SelecaoAdicional selecao = validarSelecao(input);
        validarOpcoesInput(input, selecao);

        Adicional adicional = new Adicional();
        adicional.setOrganizationId(orgId);
        adicional.setCategoriaId(categoria.getId());
        adicional.setNome(input.getNome().trim());
        adicional.setSelecao(selecao);
        adicional.setMinimo(normalizarMinimo(input, selecao));
        adicional.setLimite(normalizarLimite(input, selecao));
        adicional.setAtivo(Boolean.TRUE.equals(input.getStatus()));
        adicional.setCriadoPor(userId);
        adicional.setDataCriacao(LocalDateTime.now());

        adicional.getItens().addAll(mapearItens(input.getOpcoes(), adicional, orgId));

        Adicional salvo = adicionalRepository.save(adicional);
        log.info("Adicional criado id={} org={}", salvo.getId(), orgId);
        return salvo;
    }

    @Transactional
    public Adicional atualizar(Long id, AdicionalInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Adicional existente = buscar(id);

        Categoria categoria = validarCategoria(orgId, input.getIdCategoria());
        SelecaoAdicional selecao = validarSelecao(input);
        validarOpcoesInput(input, selecao);

        existente.setCategoriaId(categoria.getId());
        existente.setNome(input.getNome().trim());
        existente.setSelecao(selecao);
        existente.setMinimo(normalizarMinimo(input, selecao));
        existente.setLimite(normalizarLimite(input, selecao));
        existente.setAtivo(Boolean.TRUE.equals(input.getStatus()));
        existente.setDataAtualizacao(LocalDateTime.now());

        sincronizarItens(existente, input.getOpcoes());

        if (Boolean.FALSE.equals(existente.getAtivo())) {
            existente.getItens().forEach(i -> {
                i.setAtivo(false);
                i.setDataAtualizacao(LocalDateTime.now());
            });
        }

        Adicional salvo = adicionalRepository.save(existente);
        log.info("Adicional atualizado id={} org={}", salvo.getId(), orgId);
        return salvo;
    }

    @Transactional
    public void excluir(Long id) {
        Adicional adicional = buscar(id);
        adicional.setAtivo(false);
        adicional.setDataAtualizacao(LocalDateTime.now());
        adicional.getItens().forEach(item -> {
            item.setAtivo(false);
            item.setDataAtualizacao(LocalDateTime.now());
        });
        adicionalRepository.save(adicional);
        log.info("Adicional desativado id={}", id);
    }

    private Categoria validarCategoria(Long orgId, Long categoriaId) {
        return categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(categoriaId, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria invalida ou inativa"));
    }

    private SelecaoAdicional validarSelecao(AdicionalInput input) {
        try {
            return SelecaoAdicional.valueOf(input.getSelecao());
        } catch (Exception e) {
            throw new AdicionalSelecaoInvalidaException("selecao deve ser U, M ou Q");
        }
    }

    private void validarOpcoesInput(AdicionalInput input, SelecaoAdicional selecao) {
        if (input.getOpcoes() == null || input.getOpcoes().isEmpty()) {
            throw new IllegalArgumentException("deve informar ao menos uma opcao");
        }

        // Validacao de duplicidade por nome (case-insensitive)
        Set<String> nomesLower = new HashSet<>();
        for (AdicionalOpcaoInput opcao : input.getOpcoes()) {
            if (!StringUtils.hasText(opcao.getNome())) {
                throw new IllegalArgumentException("nome da opcao e obrigatorio");
            }
            String key = opcao.getNome().trim().toLowerCase();
            if (!nomesLower.add(key)) {
                throw new IllegalArgumentException("nomes de opcoes nao podem se repetir");
            }
            if (opcao.getValor() == null || opcao.getValor().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("valor deve ser maior que zero");
            }
        }

        switch (selecao) {
            case U -> {
                if (input.getOpcoes().stream().noneMatch(o -> !Boolean.FALSE.equals(o.getStatus()))) {
                    throw new AdicionalSelecaoInvalidaException("Selecao U exige ao menos um item ativo");
                }
            }
            case M -> {
                if (input.getLimite() != null && input.getLimite() < 1) {
                    throw new AdicionalSelecaoInvalidaException("limite deve ser >=1 para selecao M");
                }
            }
            case Q -> {
                if (input.getLimite() == null || input.getLimite() < 1) {
                    throw new AdicionalSelecaoInvalidaException("limite obrigatorio e deve ser >=1 para selecao Q");
                }
                if (input.getMinimo() == null || input.getMinimo() < 0) {
                    throw new AdicionalSelecaoInvalidaException("minimo deve ser >=0 para selecao Q");
                }
                if (input.getLimite() < input.getMinimo()) {
                    throw new AdicionalSelecaoInvalidaException("limite deve ser >= minimo para selecao Q");
                }
            }
            default -> {
            }
        }
    }

    private Integer normalizarMinimo(AdicionalInput input, SelecaoAdicional selecao) {
        return switch (selecao) {
            case Q -> Optional.ofNullable(input.getMinimo()).orElse(0);
            default -> null;
        };
    }

    private Integer normalizarLimite(AdicionalInput input, SelecaoAdicional selecao) {
        return switch (selecao) {
            case U -> 1;
            case M -> input.getLimite() != null ? input.getLimite() : null;
            case Q -> input.getLimite();
        };
    }

    private List<AdicionalItem> mapearItens(List<AdicionalOpcaoInput> opcoesInput, Adicional adicional, Long orgId) {
        return opcoesInput.stream().map(in -> {
            AdicionalItem item = new AdicionalItem();
            item.setOrganizationId(orgId);
            item.setAdicional(adicional);
            item.setNome(in.getNome().trim());
            item.setValor(in.getValor());
            item.setAtivo(!Boolean.FALSE.equals(in.getStatus()));
            item.setDataCriacao(LocalDateTime.now());
            return item;
        }).collect(Collectors.toList());
    }

    private void sincronizarItens(Adicional adicional, List<AdicionalOpcaoInput> novasOpcoes) {
        Map<String, AdicionalItem> atuaisPorNome = new HashMap<>();
        if (adicional.getItens() != null) {
            adicional.getItens().forEach(it -> atuaisPorNome.put(it.getNome().toLowerCase(), it));
        }

        // Desativar os que saíram
        for (AdicionalItem item : atuaisPorNome.values()) {
            boolean permanece = novasOpcoes.stream()
                    .anyMatch(o -> o.getNome().trim().equalsIgnoreCase(item.getNome()));
            if (!permanece && Boolean.TRUE.equals(item.getAtivo())) {
                item.setAtivo(false);
                item.setDataAtualizacao(LocalDateTime.now());
            }
        }

        // Adicionar/atualizar
        for (AdicionalOpcaoInput nova : novasOpcoes) {
            String key = nova.getNome().trim().toLowerCase();
            AdicionalItem existente = atuaisPorNome.get(key);
            if (existente != null) {
                existente.setValor(nova.getValor());
                existente.setAtivo(!Boolean.FALSE.equals(nova.getStatus()));
                existente.setDataAtualizacao(LocalDateTime.now());
            } else {
                AdicionalItem novo = new AdicionalItem();
                novo.setOrganizationId(adicional.getOrganizationId());
                novo.setAdicional(adicional);
                novo.setNome(nova.getNome().trim());
                novo.setValor(nova.getValor());
                novo.setAtivo(!Boolean.FALSE.equals(nova.getStatus()));
                novo.setDataCriacao(LocalDateTime.now());
                adicional.getItens().add(novo);
            }
        }
    }
}

