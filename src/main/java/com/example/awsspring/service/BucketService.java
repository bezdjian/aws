package com.example.awsspring.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class BucketService {

    private final static String BUCKET_NAME = "hb-lambdabucket";

    public List<String> getBucketContentNames(){
        final List<String> bucketContentNames = new ArrayList<>();

        ListObjectsV2Request request = new ListObjectsV2Request().withBucketName(BUCKET_NAME);
        AmazonS3 s3 = getS3Bucket();
        ListObjectsV2Result result = s3.listObjectsV2(request);
        log.info("***** Got the S3 bucket: " + BUCKET_NAME + " from " + s3.getRegionName());

        do{
            result.getObjectSummaries().forEach(
                    o -> bucketContentNames.add(o.getKey() + " : " + o.getSize() / 1024)
            );
        } while (result.isTruncated());

        log.info("***** List with content names is generated");
        return bucketContentNames;
    }

    protected AmazonS3 getS3Bucket(){
        return AmazonS3ClientBuilder.defaultClient();
    }
}
