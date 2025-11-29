package br.com.exemplo.todo.infrastructure.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.Map;

/**
 * Servico para carregar e processar templates de email.
 * Templates ficam em resources/templates/email/
 */
@Service
@Slf4j
public class EmailTemplateService {

    private static final String TEMPLATE_PATH = "templates/email/";

    /**
     * Carrega um template e substitui os placeholders pelos valores fornecidos.
     * Placeholders no formato {{chave}} sao substituidos pelos valores do Map.
     *
     * @param templateName Nome do arquivo de template (ex: "magic-link.html")
     * @param variables Map com chave/valor para substituicao
     * @return HTML processado
     */
    public String processTemplate(String templateName, Map<String, String> variables) {
        String template = loadTemplate(templateName);

        // Adiciona variaveis padrao
        variables.putIfAbsent("year", String.valueOf(Year.now().getValue()));

        // Substitui placeholders
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            template = template.replace(placeholder, entry.getValue());
        }

        return template;
    }

    private String loadTemplate(String templateName) {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH + templateName);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Erro ao carregar template {}: {}", templateName, e.getMessage());
            throw new RuntimeException("Template de email nao encontrado: " + templateName, e);
        }
    }
}
