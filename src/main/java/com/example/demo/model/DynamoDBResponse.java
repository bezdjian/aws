package com.example.demo.model;

import java.util.List;
import java.util.Map;

public record DynamoDBResponse(List<Map<String, String>> items) {
}