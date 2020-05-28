package se.bezdjian.lambda.api.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import se.bezdjian.lambda.api.client.ReceiveSQSClient;

@Component
@Slf4j
public class Scheduler {

    final
    ReceiveSQSClient client;

    public Scheduler(ReceiveSQSClient client) {
        this.client = client;
    }

    @Scheduled(fixedRate = 5000)
    public void callLambda() {
        log.info("Calling API GATEWAY");
        ResponseEntity<String> response = client.getSQSResponse();
        log.info("Response: {}", response.getBody());
    }
}
