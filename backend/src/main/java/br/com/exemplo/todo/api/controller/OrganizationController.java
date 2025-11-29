package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.auth.MembershipOutput;
import br.com.exemplo.todo.api.dto.auth.OrganizationOutput;
import br.com.exemplo.todo.api.dto.organization.OrganizationInput;
import br.com.exemplo.todo.api.openapi.OrganizationControllerOpenApi;
import br.com.exemplo.todo.domain.service.OrganizationService;
import br.com.exemplo.todo.domain.service.OrganizationLogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/organizations", produces = "application/json")
public class OrganizationController implements OrganizationControllerOpenApi {

    private final OrganizationService organizationService;
    private final OrganizationLogoService organizationLogoService;

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

    @Override
    @PostMapping(value = "/{id}/logo", consumes = "multipart/form-data")
    public OrganizationOutput atualizarLogo(@PathVariable Long id,
                                            @RequestPart("file") MultipartFile file) {
        log.debug("POST /api/organizations/{}/logo - filename={}", id,
                file != null ? file.getOriginalFilename() : "null");
        var org = organizationLogoService.atualizarLogo(id, file);
        return OrganizationOutput.from(org);
    }

    @Override
    @DeleteMapping("/{id}/logo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerLogo(@PathVariable Long id) {
        log.debug("DELETE /api/organizations/{}/logo", id);
        organizationLogoService.removerLogo(id);
    }
}
