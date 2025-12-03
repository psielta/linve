package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.exception.UfNaoEncontradaException;
import br.com.exemplo.todo.domain.model.entity.Uf;
import br.com.exemplo.todo.domain.repository.UfRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UfService {

    private final UfRepository ufRepository;

    @Cacheable(cacheNames = "UfService.listarTodas")
    @Transactional(readOnly = true)
    public List<Uf> listarTodas() {
        log.debug("Listando todas as UFs");
        return ufRepository.findAllByOrderBySiglaAsc();
    }

    @Transactional(readOnly = true)
    public Uf buscarPorSigla(String sigla) {
        log.debug("Buscando UF por sigla: {}", sigla);
        return ufRepository.findBySiglaIgnoreCase(sigla)
                .orElseThrow(() -> new UfNaoEncontradaException(sigla, true));
    }
}
