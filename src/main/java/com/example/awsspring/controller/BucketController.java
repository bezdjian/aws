package com.example.awsspring.controller;

import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.example.awsspring.model.ErrorResponse;
import com.example.awsspring.model.ResponseClass;
import com.example.awsspring.service.BucketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("v1")
@Slf4j
public class BucketController {

    private final BucketService bucketService;

    public BucketController(BucketService bucketService) {
        this.bucketService = bucketService;
    }

    @GetMapping("/{bucketName}")
    public ResponseEntity<Object> getBucketContentNames(@PathVariable("bucketName") String bucketName) {
        try {
            List<String> names = bucketService.getBucketContentNames(bucketName);
            log.info("***** Got {} in the list", names.size());
            if (!names.isEmpty()) {
                return ResponseEntity.ok(new ResponseClass(String.valueOf(names.size()), names));
            }
            return ResponseEntity.noContent().build();
        } catch (AmazonS3Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getErrorCode() + ": " + e.getErrorMessage(),
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            HttpStatus.INTERNAL_SERVER_ERROR.name()));
        }
    }
}
