package se.sbab.sqsNotifier.api.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import se.sbab.sqsNotifier.api.model.RequestModel;

import java.util.List;

@Service
@Slf4j
public class ReceiveSQSClient {

    private static final String LAMBDA_URL = "https://3snrskdq3a.execute-api.eu-north-1.amazonaws.com";
    private static final String LAMBDA_PATH = "/Prod/receive";
    private final RestTemplate restTemplate;

    @Autowired
    public ReceiveSQSClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<List<RequestModel>> getSQSResponse() {
        try {
            return restTemplate.exchange(LAMBDA_URL + LAMBDA_PATH,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<RequestModel>>() {});
        } catch (Exception e) {
            log.error("Error while calling Lambda {}: {}", LAMBDA_PATH, e.getMessage());
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
