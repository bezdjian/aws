package se.hb.productapi.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import se.hb.productapi.entity.Product;

public interface ProductRepository extends ReactiveMongoRepository<Product, String> {
}
