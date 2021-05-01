package insurancecalculation;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AmazonDynamoDBException;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import insurancecalculation.exception.InsuranceException;
import insurancecalculation.model.ErrorMessage;
import insurancecalculation.model.InsurancePremiumRequest;
import insurancecalculation.model.InsurancePremiumResponse;
import insurancecalculation.model.InsuranceTariff;
import insurancecalculation.service.InsurancePremiumCalculator;

import java.util.HashMap;
import java.util.Map;

/**
 * Lambda function request handler.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    static final int OK = 200;
    static final int BAD_REQUEST = 400;
    static final int INTERNAL_SERVER_ERROR = 500;

    final Map<String, String> insuranceTypesWithValues = new HashMap<>();
    final AmazonDynamoDB dbClient = AmazonDynamoDBClientBuilder.standard().build();
    final DynamoDBMapper dynamoDBMapper = new DynamoDBMapper(dbClient);

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        final LambdaLogger logger = context.getLogger();

        try {
            // Extract the request parameters
            InsurancePremiumRequest insurancePremiumRequest = getRequestFromQueryParameters(input);
            // Validate request parameters
            insurancePremiumRequest.validateRequest();
            // Create DynamoDB scan expression with filter expression
            DynamoDBScanExpression scanExpression = createScanExpression(insurancePremiumRequest.getAge().toString());
            // Scan the DB for tariff results and loop through insurance tariffs and add to map to calculate by the type
            dynamoDBMapper.scan(InsuranceTariff.class, scanExpression)
                .forEach(insuranceTariff -> {
                logger.log("\nInsurance to calculate: " + insuranceTariff.toString());
                insuranceTypesWithValues.put(insuranceTariff.getType(), insuranceTariff.getTariff());
            });
            // Calculate and return response
            InsurancePremiumResponse insurancePremiumResponse = InsurancePremiumCalculator.calculate(
                    insurancePremiumRequest, insuranceTypesWithValues, logger);

            logger.log("\nReturning calculated insurance premium.");
            return responseEvent(OK, insurancePremiumResponse.toString());
        } catch (InsuranceException e) {
            return responseEvent(BAD_REQUEST,
                    createErrorMessage(BAD_REQUEST, e.getMessage()));
        } catch (AmazonDynamoDBException e) {
            e.printStackTrace();
            return responseEvent(e.getStatusCode(),
                    createErrorMessage(e.getStatusCode(), e.getMessage()));
        } catch (Exception e) {
            return responseEvent(INTERNAL_SERVER_ERROR,
                    createErrorMessage(INTERNAL_SERVER_ERROR, e.getMessage()));
        }
    }

    private DynamoDBScanExpression createScanExpression(String age) {
        HashMap<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        Map<String, String> expressionAttributeNames = new HashMap<>();
        //Map attribute name and value for scanning DynamoDB
        expressionAttributeValues.put(":age", new AttributeValue(age));
        expressionAttributeNames.put("#type", "type");
        return new DynamoDBScanExpression()
                .withFilterExpression("age = :age")
                // type is reserved keyword, adding # in front
                // 'select'ing columns with projection expression
                .withProjectionExpression("id, age, #type, tariff")
                .withExpressionAttributeNames(expressionAttributeNames)
                .withExpressionAttributeValues(expressionAttributeValues);
    }

    private String createErrorMessage(int status, String msg) {
        return ErrorMessage.builder()
                .status(status)
                .errorMessage(msg)
                .build().toString();
    }

    private APIGatewayProxyResponseEvent responseEvent(int status, String message) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        return new APIGatewayProxyResponseEvent()
                .withHeaders(headers)
                .withStatusCode(status)
                .withBody(message);
    }

    private InsurancePremiumRequest getRequestFromQueryParameters(APIGatewayProxyRequestEvent input) {
        String age = input.getQueryStringParameters().get("age");
        String loanAmount = input.getQueryStringParameters().get("loanAmount");
        String insurableLoan = input.getQueryStringParameters().get("insurableAmount");
        return InsurancePremiumRequest.builder()
                .age(Long.valueOf(age))
                .insurableAmount(Long.valueOf(insurableLoan))
                .loanAmount(Long.valueOf(loanAmount))
                .build();
    }
}