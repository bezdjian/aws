package bucketcontentnames;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;


/**
 * POJO containing response object for API Gateway.
 */
@Data
@AllArgsConstructor
public class GatewayResponse {

    private final String body;
    private final Map<String, String> headers;
    private final int statusCode;
}
