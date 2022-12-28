package com.example.demo.service;

import com.amazonaws.services.s3.AmazonS3;
import com.example.demo.model.BucketObject;
import com.example.demo.model.BucketsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonS3ClientService {

  @Autowired
  private final AmazonS3 s3;

  public BucketsResponse getBuckets() {
    log.info("*** Got s3 client in region: {}", s3.getRegionName());

    var buckets = s3.listBuckets().stream()
      .map(b -> new BucketObject(b.getName(), b.getCreationDate()))
      .collect(Collectors.toList());

    return new BucketsResponse(buckets);
  }
}
