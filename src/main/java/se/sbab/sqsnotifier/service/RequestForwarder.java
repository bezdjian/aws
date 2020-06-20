package se.sbab.sqsnotifier.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import se.sbab.sqsnotifier.api.model.Headers;
import se.sbab.sqsnotifier.api.model.RequestModel;
import se.sbab.sqsnotifier.util.RequestConstants;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RequestForwarder {

    private static HttpHeaders getHttpHeaders(Headers headers) {
        HttpHeaders httpHeaders = new org.springframework.http.HttpHeaders();
        httpHeaders.add(HttpHeaders.CONTENT_TYPE, headers.getContentType());
        httpHeaders.add(HttpHeaders.AUTHORIZATION, headers.getAuthorization());
        httpHeaders.add(HttpHeaders.CONTENT_LENGTH, headers.getContentLength());
        return httpHeaders;
    }

    public void forwardRequest(List<RequestModel> requestModel) throws NoSuchAlgorithmException,
            KeyManagementException {

        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }

                    public void checkClientTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }
                }
        };
        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
        CloseableHttpClient httpClient = HttpClients.custom()
                .setSSLContext(sslContext)
                .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                .build();
        HttpComponentsClientHttpRequestFactory customRequestFactory = new HttpComponentsClientHttpRequestFactory();
        customRequestFactory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(customRequestFactory);

        requestModel.forEach(requestModel1 -> {
            try {
                sendRequest(requestModel1, restTemplate);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void sendRequest(RequestModel requestModel, RestTemplate restTemplate) throws URISyntaxException {
        Map<String, String> queryStringParameters = requestModel.getQueryStringParameters();
        String env = RequestConstants.LOCALHOST;
        if (queryStringParameters != null && queryStringParameters.get("env") != null) {
            env = queryStringParameters.get("env");
        }
        String protocol, host;
        String path = RequestConstants.API_SCRIVE_CALLBACK_URL;
        int port = -1;
        log.info("Environment is {}", env);
        switch (env) {
        case RequestConstants.LOCALHOST:
            protocol = RequestConstants.HTTP_SCHEME;
            host = RequestConstants.LOCALHOST;
            path = RequestConstants.E_SIGNING_SERVICE_URL;
            port = 8082;
            break;
        case RequestConstants.ENV_SYS:
            protocol = RequestConstants.HTTPS_SCHEME;
            host = RequestConstants.API_SYS;
            break;
        case RequestConstants.ENV_ACC:
            protocol = RequestConstants.HTTPS_SCHEME;
            host = RequestConstants.API_ACC;
            break;
        default:
            protocol = RequestConstants.HTTPS_SCHEME;
            host = RequestConstants.API_STAGE;
            break;
        }
        Headers headers = requestModel.getHeaders();

        URI uri = new URI(protocol, null, host, port, path, null, null);
        restTemplate.postForEntity(uri, new HttpEntity<>(requestModel.getBody(), getHttpHeaders(headers)), Void.class);
    }
}
