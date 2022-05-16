package se.hb.productapi.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEvent {

    private String id;
    private String eventType;

    @Override
    @SneakyThrows
    public String toString() {
        return new ObjectMapper().writeValueAsString(this);
    }
}
