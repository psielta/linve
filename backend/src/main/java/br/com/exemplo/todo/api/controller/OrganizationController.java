package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.auth.MembershipOutput;
import br.com.exemplo.todo.api.dto.auth.OrganizationOutput;
import br.com.exemplo.todo.api.dto.organization.OrganizationInput;
import br.com.exemplo.todo.api.openapi.OrganizationControllerOpenApi;
import br.com.exemplo.todo.domain.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/organizations", produces = "application/json")
public class OrganizationController implements OrganizationControllerOpenApi {

    private final OrganizationService organizationService;

    @Override
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MembershipOutput criar(@RequestBody @Valid OrganizationInput input) {
        log.debug("POST /api/organizations - nome={}", input.nome());
        return organizationService.criarOrganizacao(input);
    }

    @Override
    @PutMapping("/{id}")
    public OrganizationOutput atualizar(@PathVariable Long id, @RequestBody @Valid OrganizationInput input) {
        log.debug("PUT /api/organizations/{} - nome={}", id, input.nome());
        return organizationService.atualizarOrganizacao(id, input);
    }
}
