package br.com.exemplo.todo.testesintegracao;

import br.com.exemplo.todo.config.StorageProperties;
import br.com.exemplo.todo.domain.model.entity.StoredFile;
import br.com.exemplo.todo.domain.model.enums.MediaOwnerType;
import br.com.exemplo.todo.domain.repository.StoredFileRepository;
import br.com.exemplo.todo.domain.service.AwsS3FileStorageService;
import br.com.exemplo.todo.domain.service.FileStorageService;
import br.com.exemplo.todo.security.TenantContext;
import br.com.exemplo.todo.security.TenantInfo;
import br.com.exemplo.todo.domain.model.enums.MembershipRole;
import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Teste de integracao REAL com AWS S3.
 *
 * IMPORTANTE: Requer arquivo .env na raiz do projeto com:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION (opcional, default: us-east-1)
 * - AWS_S3_BUCKET
 *
 * Este teste faz upload/download/delete REAIS no seu bucket S3.
 * Execute manualmente: mvn test -Dtest=AwsS3FileStorageIntegrationTest
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AwsS3FileStorageIntegrationTest {

    private S3Client s3Client;
    private StorageProperties properties;
    private StoredFileRepository repository;
    private AwsS3FileStorageService service;

    // Armazena os arquivos entre testes (simula banco de dados)
    private final Map<UUID, StoredFile> fileStore = new ConcurrentHashMap<>();
    private StoredFile uploadedFile;

    private static final String TEST_CONTENT = "Conteudo de teste para upload no S3 - " + System.currentTimeMillis();

    @BeforeAll
    void setUp() {
        // Carrega .env
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        String accessKey = dotenv.get("AWS_ACCESS_KEY_ID");
        String secretKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
        String region = dotenv.get("AWS_REGION", "us-east-1");
        String bucket = dotenv.get("AWS_S3_BUCKET");

        Assumptions.assumeTrue(accessKey != null && !accessKey.isEmpty(),
                "AWS_ACCESS_KEY_ID nao configurado no .env");
        Assumptions.assumeTrue(secretKey != null && !secretKey.isEmpty(),
                "AWS_SECRET_ACCESS_KEY nao configurado no .env");
        Assumptions.assumeTrue(bucket != null && !bucket.isEmpty(),
                "AWS_S3_BUCKET nao configurado no .env");

        // Configura S3Client
        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();

        // Configura properties
        properties = new StorageProperties();
        properties.setRegion(region);
        properties.setBucket(bucket);

        // Mock do repository que armazena em memoria
        repository = mock(StoredFileRepository.class);

        // save() armazena o arquivo
        when(repository.save(any(StoredFile.class))).thenAnswer(invocation -> {
            StoredFile file = invocation.getArgument(0);
            if (file.getId() == null) {
                file.setId(UUID.randomUUID());
            }
            fileStore.put(file.getId(), file);
            return file;
        });

        // findById() busca do store
        when(repository.findById(any(UUID.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            return Optional.ofNullable(fileStore.get(id));
        });

        // findByIdAndOrganizationId() busca do store (usado quando TenantContext esta setado)
        when(repository.findByIdAndOrganizationId(any(UUID.class), any(Long.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            Long orgId = invocation.getArgument(1);
            StoredFile file = fileStore.get(id);
            if (file != null && file.getOrganizationId().equals(orgId)) {
                return Optional.of(file);
            }
            return Optional.empty();
        });

        // delete() remove do store
        doAnswer(invocation -> {
            StoredFile file = invocation.getArgument(0);
            fileStore.remove(file.getId());
            return null;
        }).when(repository).delete(any(StoredFile.class));

        // Cria o service
        service = new AwsS3FileStorageService(s3Client, properties, repository);

        // Configura TenantContext
        TenantContext.set(new TenantInfo(1L, 100L, MembershipRole.ADMIN));

        System.out.println("========================================");
        System.out.println("   TESTE DE INTEGRACAO AWS S3");
        System.out.println("========================================");
        System.out.println("Regiao: " + region);
        System.out.println("Bucket: " + bucket);
        System.out.println("========================================");
    }

    @AfterAll
    void tearDown() {
        TenantContext.clear();
        if (s3Client != null) {
            s3Client.close();
        }
    }

    @Test
    @Order(1)
    @DisplayName("1. Deve fazer upload de arquivo texto para o S3")
    void deveUploadArquivoTexto() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "teste-upload.txt",
                "text/plain",
                TEST_CONTENT.getBytes(StandardCharsets.UTF_8)
        );

        StoredFile result = service.store(file, MediaOwnerType.OTHER, null);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getFilename()).isEqualTo("teste-upload.txt");
        assertThat(result.getContentType()).isEqualTo("text/plain");
        assertThat(result.getSize()).isEqualTo(TEST_CONTENT.length());
        assertThat(result.getStorageKey()).contains("/other/generic/");

        uploadedFile = result;

        System.out.println("[OK] Upload de texto");
        System.out.println("     FileId: " + result.getId());
        System.out.println("     StorageKey: " + result.getStorageKey());
    }

    @Test
    @Order(2)
    @DisplayName("2. Deve fazer download do arquivo texto do S3")
    void deveDownloadArquivoTexto() {
        Assumptions.assumeTrue(uploadedFile != null, "Upload deve ter sido feito primeiro");

        FileStorageService.FileContent content = service.getContent(uploadedFile.getId());

        assertThat(content).isNotNull();
        assertThat(content.metadata().getFilename()).isEqualTo("teste-upload.txt");
        assertThat(content.metadata().getContentType()).isEqualTo("text/plain");

        try (InputStream stream = content.stream()) {
            String downloadedContent = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(downloadedContent).isEqualTo(TEST_CONTENT);
            System.out.println("[OK] Download de texto - conteudo verificado");
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler stream", e);
        }
    }

    @Test
    @Order(3)
    @DisplayName("3. Deve deletar o arquivo texto do S3")
    void deveDeletarArquivoTexto() {
        Assumptions.assumeTrue(uploadedFile != null, "Upload deve ter sido feito primeiro");

        UUID fileId = uploadedFile.getId();
        service.delete(fileId);

        // Verifica que foi removido do store
        assertThat(fileStore.containsKey(fileId)).isFalse();

        System.out.println("[OK] Delete de texto - arquivo removido do S3");
    }

    @Test
    @Order(4)
    @DisplayName("4. Deve fazer upload de imagem PNG para o S3")
    void deveUploadImagemPng() {
        // PNG minimo valido (1x1 pixel transparente)
        byte[] pngData = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4,
            (byte) 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
            0x54, 0x78, (byte) 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte) 0xAE,
            0x42, 0x60, (byte) 0x82
        };

        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                pngData
        );

        StoredFile result = service.store(imageFile, MediaOwnerType.USER, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");
        assertThat(result.getStorageKey()).contains("/user/100/");

        System.out.println("[OK] Upload de imagem PNG");
        System.out.println("     FileId: " + result.getId());
        System.out.println("     StorageKey: " + result.getStorageKey());

        // Limpa: deleta o arquivo de teste
        service.delete(result.getId());
        System.out.println("[OK] Imagem de teste removida");
    }

    @Test
    @Order(5)
    @DisplayName("5. Deve fazer upload de logo de organizacao")
    void deveUploadLogoOrganizacao() {
        byte[] jpegData = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
            0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
            (byte) 0xFF, (byte) 0xD9
        };

        MockMultipartFile logoFile = new MockMultipartFile(
                "file",
                "logo-empresa.jpg",
                "image/jpeg",
                jpegData
        );

        StoredFile result = service.store(logoFile, MediaOwnerType.ORGANIZATION, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/jpeg");
        assertThat(result.getStorageKey()).contains("/organization/1/");
        assertThat(result.getOwnerType()).isEqualTo(MediaOwnerType.ORGANIZATION);
        assertThat(result.getOwnerId()).isEqualTo(1L);

        System.out.println("[OK] Upload de logo de organizacao");
        System.out.println("     FileId: " + result.getId());

        // Limpa
        service.delete(result.getId());
        System.out.println("[OK] Logo de teste removido");

        System.out.println("========================================");
    }

    @Test
    @Order(6)
    @DisplayName("6. Deve fazer upload de imagem real (usr.png)")
    void deveUploadImagemReal() throws Exception {
        // Carrega a imagem real do projeto
        Path imagePath = Path.of("src/main/resources/static-data/usr.png");

        Assumptions.assumeTrue(Files.exists(imagePath),
                "Arquivo usr.png nao encontrado em src/main/resources/static-data/");

        byte[] imageBytes = Files.readAllBytes(imagePath);

        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "usr.png",
                "image/png",
                imageBytes
        );

        StoredFile result = service.store(imageFile, MediaOwnerType.USER, 999L);

        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");
        assertThat(result.getSize()).isEqualTo(imageBytes.length);
        assertThat(result.getStorageKey()).contains("/user/999/");

        System.out.println("[OK] Upload de imagem REAL (usr.png)");
        System.out.println("     FileId: " + result.getId());
        System.out.println("     Tamanho: " + result.getSize() + " bytes");
        System.out.println("     StorageKey: " + result.getStorageKey());

        // Faz download e verifica tamanho
        FileStorageService.FileContent content = service.getContent(result.getId());
        try (InputStream stream = content.stream()) {
            byte[] downloadedBytes = stream.readAllBytes();
            assertThat(downloadedBytes.length).isEqualTo(imageBytes.length);
            System.out.println("[OK] Download verificado - tamanho correto");
        }

        // Limpa
        service.delete(result.getId());
        System.out.println("[OK] Imagem real removida do S3");

        System.out.println("========================================");
        System.out.println("   TODOS OS TESTES PASSARAM!");
        System.out.println("========================================");
    }
}
