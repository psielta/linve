package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.api.dto.categoria.CategoriaDisponibilidadeDto;
import br.com.exemplo.todo.api.dto.categoria.CategoriaInput;
import br.com.exemplo.todo.api.dto.categoria.CategoriaOpcaoInput;
import br.com.exemplo.todo.domain.model.entity.Categoria;
import br.com.exemplo.todo.domain.model.entity.CategoriaOpcao;
import br.com.exemplo.todo.domain.repository.CategoriaRepository;
import br.com.exemplo.todo.domain.service.exception.CategoriaNaoEncontradaException;
import br.com.exemplo.todo.domain.service.exception.CategoriaOpcaoNaoEncontradaException;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private static final DateTimeFormatter HORARIO_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final CategoriaRepository categoriaRepository;
    private final CulinariaService culinariaService;

    @Transactional(readOnly = true)
    public List<Categoria> listar(Integer idCulinaria) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Listando categorias da organizacao {} - idCulinaria={}", orgId, idCulinaria);

        if (idCulinaria != null) {
            return categoriaRepository.findByOrganizationIdAndAtivoTrueAndCulinariaIdOrderByOrdemAscNomeAsc(orgId, idCulinaria);
        }

        return categoriaRepository.findByOrganizationIdAndAtivoTrueOrderByOrdemAscNomeAsc(orgId);
    }

    @Transactional(readOnly = true)
    public Categoria buscarPorId(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Buscando categoria {} na organizacao {}", id, orgId);

        return categoriaRepository.findByIdAndOrganizationIdAndAtivoTrue(id, orgId)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(id));
    }

    @Transactional
    public Categoria criar(CategoriaInput input) {
        Long orgId = TenantContext.getOrganizationId();
        Long userId = TenantContext.getUserId();
        log.debug("Criando categoria na organizacao {} com nome {}", orgId, input.getNome());

        validarNegocio(input, null, orgId);

        Categoria categoria = new Categoria();
        categoria.setOrganizationId(orgId);
        categoria.setCulinariaId(input.getIdCulinaria());
        categoria.setOrdem(input.getOrdem());
        categoria.setNome(input.getNome());
        categoria.setDescricao(input.getDescricao());
        categoria.setOpcaoMeia(normalizarOpcaoMeia(input.getOpcaoMeia()));
        aplicarDisponibilidade(input.getDisponivel(), categoria);

        Horario intervalo = normalizarHorario(input.getInicio(), input.getFim());
        categoria.setInicio(intervalo.inicio());
        categoria.setFim(intervalo.fim());

        categoria.setAtivo(true);
        categoria.setDataCriacao(LocalDateTime.now());
        categoria.setCriadoPor(userId);

        List<CategoriaOpcao> opcoes = criarOpcoes(input.getOpcoes(), categoria);
        categoria.setOpcoes(opcoes);

        Categoria salva = categoriaRepository.save(categoria);
        log.info("Categoria criada com ID {} na organizacao {}", salva.getId(), orgId);

        return salva;
    }

    @Transactional
    public Categoria atualizar(Long id, CategoriaInput input) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Atualizando categoria {} na organizacao {}", id, orgId);

        Categoria existente = buscarPorId(id);

        validarNegocio(input, existente, orgId);

        existente.setCulinariaId(input.getIdCulinaria());
        existente.setOrdem(input.getOrdem());
        existente.setNome(input.getNome());
        existente.setDescricao(input.getDescricao());
        existente.setOpcaoMeia(normalizarOpcaoMeia(input.getOpcaoMeia()));

        aplicarDisponibilidade(input.getDisponivel(), existente);

        Horario intervalo = normalizarHorario(input.getInicio(), input.getFim());
        existente.setInicio(intervalo.inicio());
        existente.setFim(intervalo.fim());

        sincronizarOpcoes(existente, input.getOpcoes());

        existente.setDataAtualizacao(LocalDateTime.now());

        Categoria atualizada = categoriaRepository.save(existente);
        log.info("Categoria {} atualizada na organizacao {}", id, orgId);

        return atualizada;
    }

    @Transactional
    public void excluir(Long id) {
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Desativando (soft delete) categoria {} na organizacao {}", id, orgId);

        Categoria categoria = buscarPorId(id);
        categoria.setAtivo(false);
        categoria.setDataAtualizacao(LocalDateTime.now());

        if (categoria.getOpcoes() != null) {
            categoria.getOpcoes().forEach(opcao -> opcao.setAtivo(false));
        }

        categoriaRepository.save(categoria);
        log.info("Categoria {} desativada na organizacao {}", id, orgId);
    }

    @Transactional(readOnly = true)
    public List<CategoriaOpcao> listarOpcoes(Long categoriaId) {
        Categoria categoria = buscarPorId(categoriaId);
        List<CategoriaOpcao> opcoesAtivas = new ArrayList<>();
        if (categoria.getOpcoes() != null) {
            categoria.getOpcoes().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getAtivo()))
                    .sorted((o1, o2) -> o1.getNome().compareToIgnoreCase(o2.getNome()))
                    .forEach(opcoesAtivas::add);
        }
        return opcoesAtivas;
    }

    @Transactional
    public CategoriaOpcao adicionarOpcao(Long categoriaId, CategoriaOpcaoInput input) {
        Categoria categoria = buscarPorId(categoriaId);
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Adicionando opcao '{}' na categoria {} (org {})", input.getNome(), categoriaId, orgId);

        String novoNomeNormalizado = normalizarNomeOpcao(input.getNome());
        boolean existe = categoria.getOpcoes() != null && categoria.getOpcoes().stream()
                .filter(o -> Boolean.TRUE.equals(o.getAtivo()))
                .anyMatch(o -> normalizarNomeOpcao(o.getNome()).equals(novoNomeNormalizado));

        if (existe) {
            throw new IllegalArgumentException("Ja existe uma opcao ativa com este nome para a categoria");
        }

        CategoriaOpcao opcao = new CategoriaOpcao();
        opcao.setCategoria(categoria);
        opcao.setNome(input.getNome());
        opcao.setAtivo(true);

        categoria.getOpcoes().add(opcao);
        categoriaRepository.save(categoria);

        return opcao;
    }

    @Transactional
    public CategoriaOpcao atualizarOpcao(Long categoriaId, Long opcaoId, CategoriaOpcaoInput input) {
        Categoria categoria = buscarPorId(categoriaId);
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Atualizando opcao {} na categoria {} (org {})", opcaoId, categoriaId, orgId);

        CategoriaOpcao opcao = buscarOpcaoNaCategoria(categoria, opcaoId);

        String novoNomeNormalizado = normalizarNomeOpcao(input.getNome());
        boolean existeComMesmoNome = categoria.getOpcoes().stream()
                .filter(o -> Boolean.TRUE.equals(o.getAtivo()))
                .anyMatch(o -> !o.getId().equals(opcaoId)
                        && normalizarNomeOpcao(o.getNome()).equals(novoNomeNormalizado));

        if (existeComMesmoNome) {
            throw new IllegalArgumentException("Ja existe outra opcao ativa com este nome para a categoria");
        }

        opcao.setNome(input.getNome());
        categoriaRepository.save(categoria);

        return opcao;
    }

    @Transactional
    public void desativarOpcao(Long categoriaId, Long opcaoId) {
        Categoria categoria = buscarPorId(categoriaId);
        Long orgId = TenantContext.getOrganizationId();
        log.debug("Desativando opcao {} na categoria {} (org {})", opcaoId, categoriaId, orgId);

        CategoriaOpcao opcao = buscarOpcaoNaCategoria(categoria, opcaoId);
        opcao.setAtivo(false);

        categoriaRepository.save(categoria);
    }

    private void validarNegocio(CategoriaInput input, Categoria existente, Long orgId) {
        culinariaService.buscarPorId(input.getIdCulinaria());

        String opcaoMeiaNormalizada = normalizarOpcaoMeia(input.getOpcaoMeia());
        if (!opcaoMeiaNormalizada.isEmpty()
                && !opcaoMeiaNormalizada.equals("M")
                && !opcaoMeiaNormalizada.equals("V")) {
            throw new IllegalArgumentException("opcao_meia deve ser '', 'M' ou 'V'");
        }

        if (input.getOrdem() != null) {
            categoriaRepository.findByOrganizationIdAndOrdemAndAtivoTrue(orgId, input.getOrdem())
                    .ifPresent(categoria -> {
                        if (existente == null || !categoria.getId().equals(existente.getId())) {
                            throw new IllegalArgumentException("Ja existe categoria com esta ordem para a organizacao");
                        }
                    });
        }

        if (input.getOpcoes() == null || input.getOpcoes().isEmpty()) {
            throw new IllegalArgumentException("Deve informar ao menos uma opcao");
        }
    }

    private void aplicarDisponibilidade(CategoriaDisponibilidadeDto dto, Categoria categoria) {
        if (dto == null) {
            categoria.setDisponivelDomingo(false);
            categoria.setDisponivelSegunda(true);
            categoria.setDisponivelTerca(true);
            categoria.setDisponivelQuarta(true);
            categoria.setDisponivelQuinta(true);
            categoria.setDisponivelSexta(true);
            categoria.setDisponivelSabado(true);
            return;
        }

        if (dto.getDomingo() != null) {
            categoria.setDisponivelDomingo(dto.getDomingo());
        }
        if (dto.getSegunda() != null) {
            categoria.setDisponivelSegunda(dto.getSegunda());
        }
        if (dto.getTerca() != null) {
            categoria.setDisponivelTerca(dto.getTerca());
        }
        if (dto.getQuarta() != null) {
            categoria.setDisponivelQuarta(dto.getQuarta());
        }
        if (dto.getQuinta() != null) {
            categoria.setDisponivelQuinta(dto.getQuinta());
        }
        if (dto.getSexta() != null) {
            categoria.setDisponivelSexta(dto.getSexta());
        }
        if (dto.getSabado() != null) {
            categoria.setDisponivelSabado(dto.getSabado());
        }
    }

    private Horario normalizarHorario(String inicioStr, String fimStr) {
        String inicio = (inicioStr == null || inicioStr.isBlank()) ? null : inicioStr.trim();
        String fim = (fimStr == null || fimStr.isBlank()) ? null : fimStr.trim();

        if (inicio == null && fim == null) {
            return new Horario(null, null);
        }

        if (inicio == null || fim == null) {
            throw new IllegalArgumentException("Quando informado, inicio e fim devem ser preenchidos");
        }

        try {
            LocalTime horaInicio = LocalTime.parse(inicio, HORARIO_FORMATTER);
            LocalTime horaFim = LocalTime.parse(fim, HORARIO_FORMATTER);

            if (horaInicio.isAfter(horaFim) || horaInicio.equals(horaFim)) {
                throw new IllegalArgumentException("inicio deve ser menor que fim");
            }

            return new Horario(horaInicio.format(HORARIO_FORMATTER), horaFim.format(HORARIO_FORMATTER));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("inicio e fim devem estar no formato HH:mm entre 00:00 e 23:59");
        }
    }

    private String normalizarOpcaoMeia(String opcaoMeia) {
        if (opcaoMeia == null) {
            return "";
        }
        String valor = opcaoMeia.trim().toUpperCase(Locale.ROOT);
        if (valor.isEmpty()) {
            return "";
        }
        return valor;
    }

    private List<CategoriaOpcao> criarOpcoes(List<String> nomesOpcoes, Categoria categoria) {
        List<CategoriaOpcao> opcoes = new ArrayList<>();
        Set<String> nomesNormalizados = new HashSet<>();

        for (String nome : nomesOpcoes) {
            String normalizado = normalizarNomeOpcao(nome);
            if (normalizado.isEmpty()) {
                continue;
            }
            if (!nomesNormalizados.add(normalizado)) {
                continue;
            }

            CategoriaOpcao opcao = new CategoriaOpcao();
            opcao.setCategoria(categoria);
            opcao.setNome(nome.trim());
            opcao.setAtivo(true);
            opcoes.add(opcao);
        }

        if (opcoes.isEmpty()) {
            throw new IllegalArgumentException("Deve informar ao menos uma opcao valida");
        }

        return opcoes;
    }

    private void sincronizarOpcoes(Categoria categoria, List<String> novosNomes) {
        if (novosNomes == null || novosNomes.isEmpty()) {
            throw new IllegalArgumentException("Deve informar ao menos uma opcao");
        }

        Map<String, String> novosNomesMap = new HashMap<>();
        for (String nome : novosNomes) {
            String normalizado = normalizarNomeOpcao(nome);
            if (!normalizado.isEmpty()) {
                novosNomesMap.put(normalizado, nome.trim());
            }
        }

        if (novosNomesMap.isEmpty()) {
            throw new IllegalArgumentException("Deve informar ao menos uma opcao valida");
        }

        if (categoria.getOpcoes() == null) {
            categoria.setOpcoes(new ArrayList<>());
        }

        for (CategoriaOpcao existente : categoria.getOpcoes()) {
            if (Boolean.TRUE.equals(existente.getAtivo())) {
                String normalizado = normalizarNomeOpcao(existente.getNome());
                if (!novosNomesMap.containsKey(normalizado)) {
                    existente.setAtivo(false);
                }
            }
        }

        Set<String> existentesNormalizadosAtivos = new HashSet<>();
        for (CategoriaOpcao existente : categoria.getOpcoes()) {
            if (Boolean.TRUE.equals(existente.getAtivo())) {
                existentesNormalizadosAtivos.add(normalizarNomeOpcao(existente.getNome()));
            }
        }

        for (Map.Entry<String, String> entry : novosNomesMap.entrySet()) {
            if (!existentesNormalizadosAtivos.contains(entry.getKey())) {
                CategoriaOpcao nova = new CategoriaOpcao();
                nova.setCategoria(categoria);
                nova.setNome(entry.getValue());
                nova.setAtivo(true);
                categoria.getOpcoes().add(nova);
            }
        }
    }

    private String normalizarNomeOpcao(String nome) {
        if (nome == null) {
            return "";
        }
        return nome.trim().toLowerCase(Locale.ROOT);
    }

    private CategoriaOpcao buscarOpcaoNaCategoria(Categoria categoria, Long opcaoId) {
        if (categoria.getOpcoes() == null) {
            throw new CategoriaOpcaoNaoEncontradaException(opcaoId);
        }

        return categoria.getOpcoes().stream()
                .filter(o -> o.getId().equals(opcaoId))
                .findFirst()
                .orElseThrow(() -> new CategoriaOpcaoNaoEncontradaException(opcaoId));
    }

    private record Horario(String inicio, String fim) {
    }
}
