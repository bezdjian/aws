package se.sbab.sqsNotifier;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import se.sbab.sqsNotifier.api.client.ReceiveSQSClient;
import se.sbab.sqsNotifier.api.component.Scheduler;
import se.sbab.sqsNotifier.service.RequestForwarder;

import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;

public class TestScheduler {

    public static void main(String[] args) throws URISyntaxException, KeyManagementException, NoSuchAlgorithmException, JsonProcessingException {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("trend3.sbab.ad", 8080));
        requestFactory.setProxy(proxy);
        RestTemplate restTemplate =  new RestTemplate(requestFactory);
        Scheduler scheduler = new Scheduler(new ReceiveSQSClient(restTemplate), new RequestForwarder());
        scheduler.callLambda();
    }

}
