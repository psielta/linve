package br.com.exemplo.todo.domain.service;

import br.com.exemplo.todo.domain.exception.CulinariaNotFoundException;
import br.com.exemplo.todo.domain.model.entity.Culinaria;
import br.com.exemplo.todo.domain.repository.CulinariaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CulinariaService {

    private final CulinariaRepository repository;

    @Cacheable(cacheNames = "CulinariaService.listarTodas")
    @Transactional(readOnly = true)
    public List<Culinaria> listarTodas() {
        return repository.findAllByOrderByNomeAsc();
    }

    @Cacheable(cacheNames = "CulinariaService.listarMeioMeio")
    @Transactional(readOnly = true)
    public List<Culinaria> listarMeioMeio() {
        return repository.findByMeioMeioTrueOrderByNomeAsc();
    }

    @Transactional(readOnly = true)
    public Culinaria buscarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new CulinariaNotFoundException(id));
    }
}
