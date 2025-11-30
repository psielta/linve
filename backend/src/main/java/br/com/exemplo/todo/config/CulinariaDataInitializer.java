package br.com.exemplo.todo.config;

import br.com.exemplo.todo.domain.model.entity.Culinaria;
import br.com.exemplo.todo.domain.repository.CulinariaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

/**
 * Inicializa a tabela CULINARIA com dados padrA£o
 * caso esteja vazia. Serve como fallback caso a
 * migration nA£o tenha sido executada (ex.: uso do Hibernate ddl-auto).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CulinariaDataInitializer {

    private final CulinariaRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        if (repository.count() > 0) {
            return;
        }

        try (InputStream is = getClass().getResourceAsStream("/static-data/culinarias.json")) {
            if (is == null) {
                log.warn("Arquivo de seed de culinarias nao encontrado no classpath.");
                return;
            }

            List<CulinariaSeed> seeds = objectMapper.readValue(is, new TypeReference<>() {});
            List<Culinaria> entities = seeds.stream().map(this::toEntity).toList();
            repository.saveAll(entities);
            log.info("Tabela CULINARIA populada com {} registros (fallback).", entities.size());
        } catch (Exception e) {
            log.error("Falha ao semear dados de CULINARIA: {}", e.getMessage(), e);
        }
    }

    private Culinaria toEntity(CulinariaSeed seed) {
        Culinaria c = new Culinaria();
        c.setId(seed.id_culinaria());
        c.setNome(seed.nome());
        c.setMeioMeio(seed.meio_meio() != null && seed.meio_meio() == 1);
        return c;
    }

    private record CulinariaSeed(Integer id_culinaria, String nome, Integer meio_meio) {}
}
