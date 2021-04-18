package insurancecalculation;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import insurancecalculation.mock.MockLambdaContext;
import insurancecalculation.model.InsurancePremiumResponse;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AppTest {

    @Test
    void successfulResponse() throws JsonProcessingException {
        // Given
        App app = new App();
        MockLambdaContext context = new MockLambdaContext();
        APIGatewayProxyRequestEvent request = createApiGatewayProxyRequestEvent();

        // When
        APIGatewayProxyResponseEvent result = app.handleRequest(request, context);

        ObjectMapper mapper = new ObjectMapper();
        InsurancePremiumResponse response = mapper.readValue(result.getBody(),
                InsurancePremiumResponse.class);

        // Then
        assertNotNull(result);
        assertEquals(5.03, response.getMonthlyLifeInsurancePremium());
        assertEquals(521.25, response.getMonthlyIncomeInsurancePremium());
        assertEquals(526.28, response.getTotalMonthlyPremium());
    }

    private APIGatewayProxyRequestEvent createApiGatewayProxyRequestEvent() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setQueryStringParameters(Map.of(
                "age", "20",
                "loanAmount", "150000",
                "insurableAmount", "15000"
        ));
        return request;
    }
}
