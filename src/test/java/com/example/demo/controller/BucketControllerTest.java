package com.example.demo.controller;

import com.example.demo.model.BucketObject;
import com.example.demo.model.BucketsResponse;
import com.example.demo.service.AmazonS3ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

class BucketControllerTest {

  @InjectMocks
  private BucketController controller;
  @Mock
  private AmazonS3ClientService s3ClientService;

  @BeforeEach
  void setUp() {
    openMocks(this);
  }

  @Test
  void listBuckets() {
    //Given
    List<BucketObject> buckets = List.of(
      new BucketObject("qqq", new Date()),
      new BucketObject("zzz", new Date())
    );
    when(s3ClientService.getBuckets()).thenReturn(new BucketsResponse(buckets));

    //When
    BucketsResponse response = controller.listBuckets();

    //Then
    assertEquals(2, response.buckets().size());
    assertEquals("qqq", response.buckets().get(0).bucketName());
    assertEquals("zzz", response.buckets().get(1).bucketName());
  }
}