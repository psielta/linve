package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.culinaria.CulinariaOutput;
import br.com.exemplo.todo.api.openapi.CulinariaControllerOpenApi;
import br.com.exemplo.todo.domain.service.CulinariaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/culinarias", produces = MediaType.APPLICATION_JSON_VALUE)
public class CulinariaController implements CulinariaControllerOpenApi {

    private final CulinariaService service;

    @Override
    @GetMapping
    public List<CulinariaOutput> listar(@RequestParam(required = false) Boolean meioMeio) {
        log.debug("GET /api/culinarias - meioMeio={}", meioMeio);
        return (Boolean.TRUE.equals(meioMeio) ? service.listarMeioMeio() : service.listarTodas())
                .stream()
                .map(CulinariaOutput::from)
                .toList();
    }

    @Override
    @GetMapping("/{id}")
    public CulinariaOutput buscarPorId(@PathVariable Integer id) {
        log.debug("GET /api/culinarias/{}", id);
        return CulinariaOutput.from(service.buscarPorId(id));
    }
}
