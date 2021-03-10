package insurancecalculation.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.SneakyThrows;

@Data
@Builder
public class ErrorMessage {
    int status;
    String errorMessage;

    @SneakyThrows
    @Override
    public String toString() {
        return new ObjectMapper()
                .writerWithDefaultPrettyPrinter()
                .writeValueAsString(this);
    }
}