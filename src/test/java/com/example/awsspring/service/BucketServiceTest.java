package com.example.awsspring.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

@Disabled
class BucketServiceTest {

    private static final String BUCKET_NAME = "TEST";
    @InjectMocks
    private BucketService service;
    private AmazonS3 amazonS3;
    @Mock
    private ListObjectsV2Request listObjectsV2;
    @Mock
    private ListObjectsV2Result listObjectsV2Result;

    @BeforeEach
    void setup() {
        openMocks(this);
        amazonS3 = mock(AmazonS3.class);
    }

    @Test
    @Disabled
    void getBucketContentNames() {
        when(service.getS3Bucket()).thenReturn(amazonS3);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(listObjectsV2Result);
        when(listObjectsV2Result.getObjectSummaries()).thenReturn(Collections.singletonList(getS3ObjectSummary()));
        when(service.getBucketContentNames(BUCKET_NAME)).thenReturn(Collections.singletonList("blabla"));
        List<String> s = service.getBucketContentNames(BUCKET_NAME);
        assertEquals(1, s.size());
    }

    private S3ObjectSummary getS3ObjectSummary() {
        S3ObjectSummary s3ObjectSummary = new S3ObjectSummary();
        s3ObjectSummary.setKey("keys");
        s3ObjectSummary.setSize(111L);
        return s3ObjectSummary;
    }
}