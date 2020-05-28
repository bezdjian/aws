package se.sbab.sqsNotifier.api.component;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import se.sbab.sqsNotifier.api.client.ReceiveSQSClient;
import se.sbab.sqsNotifier.api.model.RequestModel;
import se.sbab.sqsNotifier.service.RequestForwarder;

import java.net.URISyntaxException;
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
    public void callLambda() throws JsonProcessingException, KeyManagementException, NoSuchAlgorithmException, URISyntaxException {
        log.info("Calling API GATEWAY");
        ResponseEntity<List<RequestModel>> response = client.getSQSResponse();
        log.info("Response: {}", response.getBody());
        if(!CollectionUtils.isEmpty(response.getBody())) {
            requestForwarder.forwardRequest(response.getBody());
        }
    }
}
