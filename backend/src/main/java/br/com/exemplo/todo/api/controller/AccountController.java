package br.com.exemplo.todo.api.controller;

import br.com.exemplo.todo.api.dto.auth.UserOutput;
import br.com.exemplo.todo.api.openapi.AccountControllerOpenApi;
import br.com.exemplo.todo.domain.service.UserAvatarService;
import br.com.exemplo.todo.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/account", produces = MediaType.APPLICATION_JSON_VALUE)
public class AccountController implements AccountControllerOpenApi {

    private final UserAvatarService userAvatarService;

    @Override
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserOutput atualizarAvatar(@RequestPart("file") MultipartFile file) {
        Long userId = TenantContext.getUserId();
        log.debug("POST /api/account/avatar - userId={}, filename={}", userId,
                file != null ? file.getOriginalFilename() : "null");
        var user = userAvatarService.atualizarAvatar(userId, file);
        return UserOutput.from(user);
    }

    @Override
    @DeleteMapping("/avatar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerAvatar() {
        Long userId = TenantContext.getUserId();
        log.debug("DELETE /api/account/avatar - userId={}", userId);
        userAvatarService.removerAvatar(userId);
    }
}
