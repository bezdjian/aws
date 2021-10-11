package cdklambda;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.apache.http.HttpStatus;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;
import software.amazon.awssdk.services.ssm.model.GetParameterResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {

        try {
            LambdaLogger logger = context.getLogger();

            logInputValues(input, logger);

            String dynamoTableName = System.getenv("DB_TABLE");
            //String ssmParamName = System.getenv("SSM_PARAM_NAME");
            //final SsmClient ssmClient = getSsmClient();
            //GetParameterResponse parameter = getParameterResponse(ssmClient, ssmParamName);
            //logger.log("\n Parameter value: " + parameter.parameter().value() + "\n\n");
            //ssmClient.close();

            List<String> response = new ArrayList<>();
            ItemCollection<ScanOutcome> items = scanDynamoDB(dynamoTableName);

            items.spliterator()
                    .forEachRemaining(item -> {
                        logger.log("\n Item: " + item.toJSON());
                        response.add(item.toJSON());
                    });

            logger.log("\n\n");
            return gatewayResponse(HttpStatus.SC_OK, response.toString());
        } catch (Exception e) {
            return gatewayResponse(HttpStatus.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void logInputValues(APIGatewayProxyRequestEvent input, LambdaLogger logger) {
        logger.log("\n\n Input: " + input.toString());
        logger.log("\n\n Input body: " + input.getBody());
    }

    private ItemCollection<ScanOutcome> scanDynamoDB(String dynamoTableName) {
        return createDynamoDBClient()
                .getTable(dynamoTableName)
                .scan();
    }

    private DynamoDB createDynamoDBClient() {
        AmazonDynamoDB client = AmazonDynamoDBClient.builder().build();
        return new DynamoDB(client);
    }

    private SsmClient getSsmClient() {
        return SsmClient.builder()
                .region(Region.EU_NORTH_1)
                .build();
    }

    private GetParameterResponse getParameterResponse(SsmClient ssmClient, String ssmParamName) {
        GetParameterRequest parameterRequest = GetParameterRequest.builder()
                .name(ssmParamName)
                .build();

        return ssmClient.getParameter(parameterRequest);
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
