package com.example.demo.model;

import java.util.List;

import lombok.Value;

@Value
public class LambdaResponse {
    List<String> bucketNames;
}