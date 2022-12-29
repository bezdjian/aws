package com.example.demo.controller;

import com.example.demo.model.DynamoDBResponse;
import com.example.demo.service.AmazonDynamoDBClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DynamoController {

  @Autowired
  private final AmazonDynamoDBClientService dynamoDBClientService;

  @GetMapping("/items")
  public DynamoDBResponse getItems() {
    return dynamoDBClientService.getItems();
  }
}