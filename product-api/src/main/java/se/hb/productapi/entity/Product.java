package se.hb.productapi.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@Document
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;
    private String name;
    private double price;

    @Override
    @SneakyThrows
    public String toString() {
        return new ObjectMapper().writeValueAsString(this);
    }
}
