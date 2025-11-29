package br.com.exemplo.todo.domain.service;

/**
 * Porta de envio de e-mails.
 */
public interface EmailService {

    /**
     * Envia um email HTML.
     *
     * @param to      destinatario
     * @param subject assunto
     * @param html    corpo em HTML
     */
    void send(String to, String subject, String html);
}
