package com.example.demo.service;

import com.amazonaws.services.s3.AmazonS3;
import com.example.demo.model.BucketObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonS3ClientService {

  @Autowired
  private final AmazonS3 s3;

  public List<BucketObject> getBuckets() {
    log.info("*** Got s3 client in region: {}", s3.getRegionName());

    return s3.listBuckets().stream()
      .map(b -> new BucketObject(b.getName(), b.getCreationDate()))
      .collect(Collectors.toList());
  }
}
