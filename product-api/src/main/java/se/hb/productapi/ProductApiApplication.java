package se.hb.productapi;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import reactor.core.publisher.Flux;
import se.hb.productapi.entity.Product;
import se.hb.productapi.repository.ProductRepository;

@SpringBootApplication
@EnableMongoRepositories
public class ProductApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(ProductApiApplication.class, args);
  }


  @Bean
  CommandLineRunner init(ProductRepository productRepository) {
    return args -> {
      Flux<Product> products = createProducts()
          .doOnNext(product -> System.out.println("Product: " + product.getName()))
          .flatMap(productRepository::save);

      products.thenMany(productRepository.findAll())
          .subscribe(System.out::println);
    };
  }

  private Flux<Product> createProducts() {
    return Flux.just(Product.builder().name("Macbook Pro").price(2300.0).build(),
        Product.builder().name("Samsung Note 20").price(20000.0).build(),
        Product.builder().name("Sony").price(1300.0).build());
  }
}
