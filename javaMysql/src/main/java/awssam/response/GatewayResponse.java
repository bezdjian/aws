package awssam.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * POJO containing response object for API Gateway.
 */
@Data
@AllArgsConstructor
public class GatewayResponse {

  private final int statusCode;
  private final String body;

}
