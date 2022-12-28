package com.example.demo.service;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class AmazonS3ClientBean {

  private static final Regions REGION = Regions.EU_NORTH_1;

  @Bean
  public AmazonS3 s3() {
    return getAmazonS3();
  }

  private AmazonS3 getAmazonS3() {
    AmazonS3ClientBuilder s3ClientBuilder = AmazonS3ClientBuilder.standard();

    Optional.ofNullable(System.getenv("LOCALSTACK"))
      .ifPresentOrElse(endpoint -> setEndpointConfiguration(s3ClientBuilder, endpoint),
        () -> s3ClientBuilder.withRegion(REGION));

    return s3ClientBuilder.build();
  }

  private void setEndpointConfiguration(AmazonS3ClientBuilder s3ClientBuilder, String endpoint) {
    String serviceEndpoint = "http://" + endpoint + ":4566";
    log.info("*** LOCALSTACK is present, setting endpoint: {}", serviceEndpoint);
    s3ClientBuilder.setEndpointConfiguration(
      new AwsClientBuilder.EndpointConfiguration(serviceEndpoint,
        REGION.getName())
    );
  }
}
