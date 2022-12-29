package com.example.demo.service;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class AmazonDynamoDBClientBean {

  private static final Regions REGION = Regions.EU_NORTH_1;

  @Bean
  public AmazonDynamoDB dynamoDB() {
    return getDynamoDB();
  }

  private AmazonDynamoDB getDynamoDB() {
    AmazonDynamoDBClientBuilder dbClientBuilder = AmazonDynamoDBClientBuilder.standard();
    Optional.ofNullable(System.getenv("LOCALSTACK"))
      .ifPresentOrElse(endpoint -> setEndpointConfiguration(dbClientBuilder, endpoint),
        () -> dbClientBuilder.withRegion(REGION));

    return dbClientBuilder.build();
  }

  private void setEndpointConfiguration(AmazonDynamoDBClientBuilder s3ClientBuilder, String endpoint) {
    log.info("*** LOCALSTACK is present, setting endpoint: {}", endpoint);
    s3ClientBuilder.withEndpointConfiguration(
      new AwsClientBuilder.EndpointConfiguration("http://" + endpoint + ":4566",
        REGION.getName())
    );
  }
}
