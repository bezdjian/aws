package se.hb.productapi.api.rest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import se.hb.productapi.entity.Product;
import se.hb.productapi.model.ProductEvent;
import se.hb.productapi.repository.ProductRepository;

import java.time.Duration;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository repository;

    @GetMapping
    public Flux<Product> getAll() {
        return repository.findAll();
    }

    @GetMapping("{id}")
    public Mono<ResponseEntity<Product>> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Product> save(@RequestBody Product product) {
        return repository.save(product);
    }

    @PutMapping("{id}")
    public Mono<ResponseEntity<Product>> update(@PathVariable String id, @RequestBody Product product) {
        return repository.findById(id).flatMap(existingProduct -> {
                existingProduct.setName(product.getName());
                existingProduct.setPrice(product.getPrice());
                return repository.save(existingProduct);
            }).map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable String id) {
        return repository.findById(id)
            .flatMap(existingProduct -> repository.delete(existingProduct)
                .then(Mono.just(ResponseEntity.ok().<Void>build())))
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping
    public Mono<Void> deleteAll() {
        return repository.deleteAll();
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ProductEvent> getProductEvent() {
        return Flux.interval(Duration.ofSeconds(1))
            .map(v -> ProductEvent.builder().eventType("Event Type").id(v.toString()).build());
    }
}
