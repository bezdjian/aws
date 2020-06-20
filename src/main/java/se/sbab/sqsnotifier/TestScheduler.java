package se.sbab.sqsnotifier;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import se.sbab.sqsnotifier.api.client.ReceiveSQSClient;
import se.sbab.sqsnotifier.api.component.Scheduler;
import se.sbab.sqsnotifier.service.RequestForwarder;

import java.net.InetSocketAddress;
import java.net.Proxy;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;

public class TestScheduler {

    public static void main(String[] args) throws KeyManagementException, NoSuchAlgorithmException {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("trend3.sbab.ad", 8080));
        requestFactory.setProxy(proxy);
        RestTemplate restTemplate = new RestTemplate(requestFactory);
        Scheduler scheduler = new Scheduler(new ReceiveSQSClient(restTemplate), new RequestForwarder());
        scheduler.callLambda();
    }

}
