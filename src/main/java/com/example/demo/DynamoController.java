package com.example.demo;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.ResourceNotFoundException;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.example.demo.model.DynamoDBResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api")
public class DynamoController {

  public static final Regions REGION = Regions.EU_NORTH_1;

  @GetMapping("/items")
  public DynamoDBResponse getItems() {
    AmazonDynamoDB dynamoDB = getDynamoDB();

    log.info("*** Got dynamoDB client: {}", dynamoDB.toString());

    ScanRequest scanRequest = new ScanRequest()
      .withTableName("Albums");

    try {
      ScanResult scanResult = dynamoDB.scan(scanRequest);
      Integer count = scanResult.getCount();
      log.info("*** Got {} item(s)", count);

      List<Map<String, String>> results = new ArrayList<>();
      scanResult.getItems()
        .forEach(items -> {
          Map<String, String> resultsMap = new HashMap<>();
          items.forEach((item, value) -> resultsMap.put(item, value.getS()));
          results.add(resultsMap);
        });

      return new DynamoDBResponse(results);

    } catch (ResourceNotFoundException r) {
      log.error("Resource not found: {}", r.getMessage(), r);
      return new DynamoDBResponse(Collections.singletonList(
        Collections.singletonMap("errorMessage", r.getMessage())));
    } catch (Exception e) {
      log.error("Failed to execute request: {}", e.getMessage(), e);
      return new DynamoDBResponse(Collections.singletonList(
        Collections.singletonMap("errorMessage", e.getMessage())));
    }
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
    s3ClientBuilder.setEndpointConfiguration(
      new AwsClientBuilder.EndpointConfiguration("http://" + endpoint + ":4566",
        REGION.getName())
    );
  }
}