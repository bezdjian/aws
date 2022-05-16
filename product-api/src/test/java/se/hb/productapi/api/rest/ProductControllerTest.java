package se.hb.productapi.api.rest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.FluxExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import se.hb.productapi.entity.Product;
import se.hb.productapi.model.ProductEvent;
import se.hb.productapi.repository.ProductRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class ProductControllerTest {

    private WebTestClient webTestClient;

    @InjectMocks
    private ProductController controller;
    @Mock
    private ProductRepository repository;

    @BeforeEach
    void setup() {
        openMocks(this);
        this.webTestClient = WebTestClient
                .bindToController(controller)
                .configureClient()
                .baseUrl("/products")
                .build();
    }

    @Test
    void shouldGetAllProducts() {
        //Given
        when(repository.findAll()).thenReturn(Flux.just(mockProducts()));
        final List<Product> expectedProductList =
                // Makes a synchronous call instead.
                repository.findAll().collectList().block();

        //When & then
        assert expectedProductList != null;
        webTestClient.get()
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Product.class)
                .value(v -> v.forEach(System.out::println))
                .isEqualTo(expectedProductList);
    }

    @Test
    void shouldReturnNotFoundWhenInvalidProductId() {
        //Given
        String id = "999";
        when(repository.findById(id)).thenReturn(Mono.empty());

        //When & then
        webTestClient.get()
                .uri("/{id}", id)
                .exchange()
                .expectStatus()
                .isNotFound();
    }

    @Test
    void shouldReturnProductWithValidId() {
        //Given
        String id = "1";
        Product product = Product.builder().id(id).name("Macbook Pro").price(25000.00).build();
        when(repository.findById(id)).thenReturn(Mono.just(product));

        //When & then
        webTestClient.get()
                .uri("/{id}", id)
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody(Product.class)
                .isEqualTo(product);
    }

    @Test
    void testProductEvents() {
        //Given
        ProductEvent expectedFirstProductEvent = ProductEvent.builder()
                .eventType("Event Type")
                .id("0")
                .build();

        //When & then
        FluxExchangeResult<ProductEvent> result =
                webTestClient.get()
                        .uri("/events")
                        .accept(MediaType.TEXT_EVENT_STREAM)
                        .exchange()
                        .expectStatus().isOk()
                        .returnResult(ProductEvent.class);

        //Verify
        StepVerifier.create(result.getResponseBody())
                .expectNext(expectedFirstProductEvent)
                .expectNextCount(2) // skip over 2 events
                .consumeNextWith(event ->
                        // This is the fourth event with id 3.
                        assertEquals("3", event.getId()))
                .thenCancel()
                .verify();
    }

    private Product[] mockProducts() {
        return new Product[]{Product.builder().id("1").name("Macbook Pro").price(25000.00).build(),
                Product.builder().id("2").name("Macbook Air").price(20000.00).build(),
                Product.builder().id("3").name("Macbook Mini").price(15000.00).build()};
    }
}