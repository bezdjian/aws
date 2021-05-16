package cdklambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("\n\n Input: " + input.toString());

        String dynamoTableName = System.getenv("DB_TABLE");

        logger.log("\n\n dynamoTableName: " + dynamoTableName + "\n\n");

        return gatewayResponse(200, "Hello!");
    }

    private APIGatewayProxyResponseEvent gatewayResponse(int statusCode, String message) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        return new APIGatewayProxyResponseEvent()
            .withHeaders(headers)
            .withStatusCode(statusCode)
            .withBody(message);
    }
}
