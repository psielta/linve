package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.dadosabertos.MunicipioOutput;
import br.com.exemplo.todo.api.dto.dadosabertos.UfOutput;
import br.com.exemplo.todo.api.openapi.DadosAbertosControllerOpenApi;
import br.com.exemplo.todo.domain.model.entity.Municipio;
import br.com.exemplo.todo.domain.model.entity.Uf;
import br.com.exemplo.todo.domain.service.MunicipioService;
import br.com.exemplo.todo.domain.service.UfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/dados-abertos", produces = {"application/json", "application/problem+json"})
public class DadosAbertosController implements DadosAbertosControllerOpenApi {

    private static final String CACHE_CONTROL_HEADER = "Cache-Control";
    private static final String CACHE_CONTROL_VALUE = "public, max-age=3600";

    private final UfService ufService;
    private final MunicipioService municipioService;

    @Override
    @GetMapping("/ufs")
    public ResponseEntity<List<UfOutput>> listarUfs() {
        log.debug("GET /api/dados-abertos/ufs");
        List<UfOutput> ufs = ufService.listarTodas().stream()
                .map(this::toUfOutput)
                .toList();
        return ResponseEntity.ok()
                .header(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE)
                .body(ufs);
    }

    @Override
    @GetMapping("/ufs/municipios")
    public ResponseEntity<List<MunicipioOutput>> listarMunicipiosPorUf(
            @RequestParam String siglaUf) {
        log.debug("GET /api/dados-abertos/ufs/municipios?siglaUf={}", siglaUf);

        // Valida se a UF existe
        ufService.buscarPorSigla(siglaUf);

        List<MunicipioOutput> municipios = municipioService.listarPorUf(siglaUf).stream()
                .map(this::toMunicipioOutput)
                .toList();
        return ResponseEntity.ok()
                .header(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE)
                .body(municipios);
    }

    @Override
    @GetMapping("/municipios")
    public ResponseEntity<List<MunicipioOutput>> listarTodosMunicipios() {
        log.debug("GET /api/dados-abertos/municipios");
        List<MunicipioOutput> municipios = municipioService.listarTodos().stream()
                .map(this::toMunicipioOutput)
                .toList();
        return ResponseEntity.ok()
                .header(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE)
                .body(municipios);
    }

    private UfOutput toUfOutput(Uf uf) {
        return UfOutput.builder()
                .codigo(uf.getCodigo())
                .sigla(uf.getSigla())
                .nome(uf.getNome())
                .build();
    }

    private MunicipioOutput toMunicipioOutput(Municipio municipio) {
        return MunicipioOutput.builder()
                .codigo(municipio.getCodigo())
                .nome(municipio.getNome())
                .build();
    }
}
