package br.com.exemplo.todo.testesunitarios;

import br.com.exemplo.todo.config.cache.CacheSpecs;
import br.com.exemplo.todo.config.cache.CaffeineCacheConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CaffeineCacheConfig")
class CaffeineCacheConfigTest {

    private CaffeineCacheConfig config;

    @BeforeEach
    void setUp() {
        config = new CaffeineCacheConfig();
    }

    @Test
    @DisplayName("deve criar CacheManager com caches configurados")
    void deveCriarCacheManager() {
        CacheSpecs specs = criarCacheSpecs();

        CacheManager manager = config.cacheManager(specs);

        assertThat(manager).isNotNull();
        assertThat(manager.getCache("TestCache")).isNotNull();
    }

    @Test
    @DisplayName("deve criar multiplos caches")
    void deveCriarMultiplosCaches() {
        CacheSpecs specs = new CacheSpecs();
        specs.setSpecs(List.of(
            criarSpec("Cache1", Duration.ofHours(1), 10),
            criarSpec("Cache2", Duration.ofDays(1), 20)
        ));

        CacheManager manager = config.cacheManager(specs);

        assertThat(manager.getCache("Cache1")).isNotNull();
        assertThat(manager.getCache("Cache2")).isNotNull();
    }

    private CacheSpecs criarCacheSpecs() {
        CacheSpecs specs = new CacheSpecs();
        specs.setSpecs(List.of(criarSpec("TestCache", Duration.ofHours(1), 10)));
        return specs;
    }

    private CacheSpecs.CacheSpec criarSpec(String name, Duration expire, int capacity) {
        CacheSpecs.CacheSpec spec = new CacheSpecs.CacheSpec();
        spec.setName(name);
        spec.setExpireAfterWrite(expire);
        spec.setInitialCapacity(capacity);
        return spec;
    }
}
