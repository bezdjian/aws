package bucketcontentnames;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * POJO containing response object for API Gateway.
 */
@Data
@AllArgsConstructor
public class GatewayResponse {

    private final List<String> body;
    private final int statusCode;
}
