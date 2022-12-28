package com.example.demo.controller;

import com.example.demo.model.BucketObject;
import com.example.demo.model.BucketsResponse;
import com.example.demo.service.AmazonS3ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BucketController {

  @Autowired
  private final AmazonS3ClientService s3ClientService;

  @GetMapping("/buckets")
  public BucketsResponse listBuckets() {
    List<BucketObject> bucketNames = s3ClientService.getBuckets();
    return new BucketsResponse(bucketNames);
  }
}