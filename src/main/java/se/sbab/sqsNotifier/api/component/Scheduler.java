package se.sbab.sqsNotifier.api.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import se.sbab.sqsNotifier.api.client.ReceiveSQSClient;
import se.sbab.sqsNotifier.api.model.RequestModel;
import se.sbab.sqsNotifier.service.RequestForwarder;

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
        log.info("Calling lambda SQS receiver with Response: {}", response.getBody());
        if (!CollectionUtils.isEmpty(response.getBody())) {
            requestForwarder.forwardRequest(response.getBody());
        }
    }
}
