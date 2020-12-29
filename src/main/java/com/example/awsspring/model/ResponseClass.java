package com.example.awsspring.model;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Builder
@Value
public class ResponseClass {
    int count;
    String message;
    List<String> bucketContentNames;
}
