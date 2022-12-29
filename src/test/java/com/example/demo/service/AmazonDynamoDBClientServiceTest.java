package com.example.demo.service;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.example.demo.model.DynamoDBResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class AmazonDynamoDBClientServiceTest {

  private AmazonDynamoDBClientService clientService;
  @Mock
  private AmazonDynamoDB dynamoDB;

  @BeforeEach
  void setUp() {
    openMocks(this);
    clientService = new AmazonDynamoDBClientService(dynamoDB);
  }

  @Test
  void getItems() {
    //Given
    ScanResult scanResult = new ScanResult();
    scanResult.setCount(1);
    scanResult.setItems(List.of(
      Map.of("A", new AttributeValue("aaa"))
    ));

    when(dynamoDB.scan(any())).thenReturn(scanResult);

    //When
    DynamoDBResponse items = clientService.getItems();

    //Then
    assertEquals(1, items.items().size());
    assertEquals("aaa", items.items().get(0).get("A"));
  }
}