package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.model.entity.Municipio;
import br.com.exemplo.todo.domain.repository.MunicipioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MunicipioService {

    private final MunicipioRepository municipioRepository;

    @Cacheable(cacheNames = "MunicipioService.listarPorUf")
    @Transactional(readOnly = true)
    public List<Municipio> listarPorUf(String siglaUf) {
        log.debug("Listando municipios da UF: {}", siglaUf);
        return municipioRepository.findByUfSiglaIgnoreCaseOrderByNomeAsc(siglaUf);
    }

    @Cacheable(cacheNames = "MunicipioService.listarTodos")
    @Transactional(readOnly = true)
    public List<Municipio> listarTodos() {
        log.debug("Listando todos os municipios");
        return municipioRepository.findAllByOrderByNomeAsc();
    }
}
