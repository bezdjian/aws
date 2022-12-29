package com.example.demo.controller;

import com.example.demo.model.DynamoDBResponse;
import com.example.demo.service.AmazonDynamoDBClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class DynamoControllerTest {

  @InjectMocks
  private DynamoController controller;
  @Mock
  private AmazonDynamoDBClientService dynamoDBClientService;

  @BeforeEach
  void setUp() {
    openMocks(this);
  }

  @Test
  void getItems() {
    //Given
    when(dynamoDBClientService.getItems()).thenReturn(new DynamoDBResponse(
      List.of(
        Map.of("a", "A"),
        Map.of("b", "B"),
        Map.of("c", "C"))
    ));

    //When
    DynamoDBResponse items = controller.getItems();

    //Then
    assertEquals(3, items.items().size());
    assertEquals("A", items.items().get(0).get("a"));
    assertEquals("B", items.items().get(1).get("b"));
    assertEquals("C", items.items().get(2).get("c"));
  }
}