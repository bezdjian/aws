package insurancecalculation;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import insurancecalculation.exception.InsuranceException;
import insurancecalculation.model.ErrorMessage;
import insurancecalculation.model.InsurancePremiumRequest;
import insurancecalculation.model.InsurancePremiumResponse;
import insurancecalculation.service.InsurancePremiumCalculator;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        LambdaLogger logger = context.getLogger();
        try {
            InsurancePremiumRequest insurancePremiumRequest = getRequestFromQueryParameters(input);
            insurancePremiumRequest.validateRequest();

            InsurancePremiumResponse insurancePremiumResponse = InsurancePremiumCalculator.calculate(
                    insurancePremiumRequest, logger);

            return respond(200, insurancePremiumResponse.toString());
        } catch (InsuranceException e) {
            return respond(400,
                    createErrorMessage(400, e.getMessage()));
        } catch (Exception e) {
            return respond(500,
                    createErrorMessage(500, e.getMessage()));
        }
    }

    private String createErrorMessage(int status, String msg) {
        return ErrorMessage.builder()
                .status(status)
                .errorMessage(msg)
                .build().toString();
    }

    private APIGatewayProxyResponseEvent respond(int status, String message) {
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