package br.com.exemplo.todo.infrastructure.email;

import br.com.exemplo.todo.domain.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Adapter de envio de e-mails via MailHog (SMTP local).
 * Usado em desenvolvimento e testes (perfis nao-prod).
 */
@Service
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class MailHogEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@todo.local}")
    private String from;

    @Override
    public void send(String to, String subject, String html) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
            log.info("Email enviado via MailHog para {}", to);
        } catch (MessagingException e) {
            log.error("Erro ao montar email para {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }
}
