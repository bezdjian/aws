package com.example.awsspring.controller;

import com.example.awsspring.dto.ResponseClass;
import com.example.awsspring.service.BucketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping
    public ResponseEntity<Object> getBucketContentNames() {
        List<String> names = bucketService.getBucketContentNames();
        log.info("Got {} in the list", names.size());
        if (!names.isEmpty()) {
            return new ResponseEntity<>(new ResponseClass(String.valueOf(names.size()), names), HttpStatus.OK);
        }
        return ResponseEntity.noContent().build();
    }
}
