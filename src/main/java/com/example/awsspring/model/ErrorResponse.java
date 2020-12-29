package com.example.awsspring.model;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class ErrorResponse {
    String message;
    int statusCode;
    String status;
}
