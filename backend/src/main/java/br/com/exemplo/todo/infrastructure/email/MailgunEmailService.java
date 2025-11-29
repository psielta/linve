package br.com.exemplo.todo.infrastructure.email;

import br.com.exemplo.todo.config.MailgunProperties;
import br.com.exemplo.todo.domain.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Adapter de envio de e-mails via Mailgun (HTTP API).
 * Utilizado em producao (profile 'prod').
 */
@Service
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class MailgunEmailService implements EmailService {

    private final MailgunProperties properties;
    private final WebClient.Builder webClientBuilder;

    @Override
    public void send(String to, String subject, String html) {
        if (properties.getDomain() == null || properties.getApiKey() == null || properties.getFrom() == null) {
            log.warn("Mailgun nao configurado corretamente. Email NAO enviado para {}", to);
            return;
        }

        String url = String.format("https://api.mailgun.net/v3/%s/messages", properties.getDomain());

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("from", properties.getFrom());
        formData.add("to", to);
        formData.add("subject", subject);
        formData.add("html", html);

        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                ("api:" + properties.getApiKey()).getBytes(StandardCharsets.UTF_8));

        WebClient client = webClientBuilder.build();

        try {
            client.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .header("Authorization", basicAuth)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(ex -> {
                        log.error("Erro ao enviar email via Mailgun para {}: {}", to, ex.getMessage(), ex);
                        return Mono.empty();
                    })
                    .block();
            log.info("Email enviado via Mailgun para {}", to);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email via Mailgun para {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }
}
