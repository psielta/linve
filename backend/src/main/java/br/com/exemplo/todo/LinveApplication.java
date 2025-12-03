package br.com.exemplo.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.exemplo.todo.config.cache.CacheSpecs;

@EnableConfigurationProperties(CacheSpecs.class)
@SpringBootApplication
public class LinveApplication {

	public static void main(String[] args) {
		SpringApplication.run(LinveApplication.class, args);
	}

	@Bean
	public WebClient.Builder webClientBuilder() {
		return WebClient.builder();
	}

}
