package se.sbab.sqsnotifier.api.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import se.sbab.sqsnotifier.api.client.ReceiveSQSClient;
import se.sbab.sqsnotifier.api.model.RequestModel;
import se.sbab.sqsnotifier.service.RequestForwarder;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Component
@Slf4j
public class Scheduler {

    final ReceiveSQSClient client;

    final RequestForwarder requestForwarder;

    public Scheduler(ReceiveSQSClient client, RequestForwarder requestForwarder) {
        this.client = client;
        this.requestForwarder = requestForwarder;
    }

    @Scheduled(fixedRate = 12000)
    public void callLambda() throws KeyManagementException, NoSuchAlgorithmException {
        ResponseEntity<List<RequestModel>> response = client.getSQSResponse();
        log.info("Got response from Lambda SQS receiver: {}", response.getBody());
        if (!CollectionUtils.isEmpty(response.getBody()) &&
                response.getBody() != null && !response.getBody().isEmpty() &&
                response.getBody().get(0).getBody() != null &&
                !response.getBody().get(0).getBody().contains("[]")) {
            log.info("Forwarding request with {}", response.getBody().toString());
            requestForwarder.forwardRequest(response.getBody());
        } else {
            log.info("Got response with empty body, not forwarding");
        }
    }
}
