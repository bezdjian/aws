package com.example.demo;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;
import com.example.demo.model.BucketsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api")
public class BucketController {

  private static final Regions REGION = Regions.EU_NORTH_1;
  private final AmazonS3 s3 = getAmazonS3();

  @GetMapping("/buckets")
  public BucketsResponse listBuckets() {
    log.info("*** Got s3 client in region: {}", s3.getRegionName());

    List<Bucket> buckets = s3.listBuckets();
    log.info("*** Your Amazon S3 buckets are:");
    buckets.forEach(b -> log.info("*** {}", b.getName()));

    List<String> bucketNames = getBucketNames(s3);

    return new BucketsResponse(bucketNames);
  }

  private static List<String> getBucketNames(AmazonS3 s3) {
    return s3.listBuckets().stream()
      .map(Bucket::getName)
      .collect(Collectors.toList());
  }

  private AmazonS3 getAmazonS3() {
    AmazonS3ClientBuilder s3ClientBuilder = AmazonS3ClientBuilder.standard();

    Optional.ofNullable(System.getenv("LOCALSTACK"))
      .ifPresentOrElse(endpoint -> setEndpointConfiguration(s3ClientBuilder, endpoint),
        () -> s3ClientBuilder.withRegion(REGION));

    return s3ClientBuilder.build();
  }

  private void setEndpointConfiguration(AmazonS3ClientBuilder s3ClientBuilder, String endpoint) {
    log.info("*** LOCALSTACK is present, setting endpoint: {}", endpoint);
    s3ClientBuilder.setEndpointConfiguration(
      new AwsClientBuilder.EndpointConfiguration("http://" + endpoint + ":4566",
        REGION.getName())
    );
  }
}