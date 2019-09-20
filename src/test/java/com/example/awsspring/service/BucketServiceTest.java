package com.example.awsspring.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

public class BucketServiceTest {

    @InjectMocks
    private BucketService service;
    @Mock
    private AmazonS3 s3;
    @Mock
    private ListObjectsV2Request listObjectsV2;
    @Mock
    private ListObjectsV2Result listObjectsV2Result;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    @Ignore
    //TODO FIX THIS!
    public void getBucketContentNames() {
        List<String> namesList = new ArrayList<>();
        namesList.add("blabla");
        when(service.getBucketContentNames()).thenReturn(namesList);
        when(service.getS3Bucket()).thenReturn(s3);
        when(s3.listObjectsV2(listObjectsV2)).thenReturn(listObjectsV2Result);
        List<String> s = service.getBucketContentNames();
        assertEquals("List size is not correct", 1, s.size());
    }
}