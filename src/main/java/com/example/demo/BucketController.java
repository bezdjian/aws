package com.example.demo;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.LambdaResponse;

@RestController
@RequestMapping("/api")
public class BucketController {

  @GetMapping
  public LambdaResponse listBuckets() {
    AmazonS3ClientBuilder s3ClientBuilder = AmazonS3ClientBuilder.standard();

    Optional.ofNullable(System.getenv("LOCALSTACK"))
        .ifPresent(endpoint -> setEndpointConfiguration(s3ClientBuilder, endpoint));

    AmazonS3 s3 = s3ClientBuilder.build();

    System.out.println("--- Got s3 client: " + s3.getRegionName());

    List<Bucket> buckets = s3.listBuckets();
    System.out.println("Your Amazon S3 buckets are:");
    for (Bucket b : buckets) {
      System.out.println("* " + b.getName());
    }

     List<String> bucketNames = s3.listBuckets().stream()
        .map(Bucket::getName)
        .collect(Collectors.toList());

    return new LambdaResponse(bucketNames);
  }

  private void setEndpointConfiguration(AmazonS3ClientBuilder s3ClientBuilder, String endpoint) {
    s3ClientBuilder.setEndpointConfiguration(
        new AwsClientBuilder.EndpointConfiguration("http://" + endpoint + ":4566",
            Regions.EU_WEST_1.getName())
    );
  }
}