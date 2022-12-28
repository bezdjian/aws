package com.example.demo.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.Bucket;
import com.example.demo.model.BucketsResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class AmazonS3ClientServiceTest {

  private AmazonS3ClientService s3ClientService;

  @Mock
  private AmazonS3 s3;

  @BeforeEach
  void setUp() {
    openMocks(this);
    s3ClientService = new AmazonS3ClientService(s3);
    when(s3.getRegionName()).thenReturn("eu-north-1-test");
  }

  @Test
  void getBucketNames() {
    //Given
    when(s3.listBuckets())
      .thenReturn(List.of(
        new Bucket("b1"),
        new Bucket("b2")
      ));

    //When
    BucketsResponse buckets = s3ClientService.getBuckets();

    //Then
    assertEquals(2, buckets.buckets().size());
    assertEquals("b1", buckets.buckets().get(0).bucketName());
    assertEquals("b2", buckets.buckets().get(1).bucketName());
  }
}