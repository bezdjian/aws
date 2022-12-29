package com.example.demo.service;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.ResourceNotFoundException;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.example.demo.model.DynamoDBResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonDynamoDBClientService {

  @Autowired
  private final AmazonDynamoDB dynamoDB;

  public DynamoDBResponse getItems() {
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
}
