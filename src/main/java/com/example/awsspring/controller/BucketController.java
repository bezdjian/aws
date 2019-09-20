package com.example.awsspring.controller;

import com.example.awsspring.dto.ResponseClass;
import com.example.awsspring.service.BucketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("v1")
public class BucketController {

    private final BucketService bucketService;

    public BucketController(BucketService bucketService) {
        this.bucketService = bucketService;
    }

    @GetMapping
    public ResponseEntity getBucketContentNames() {
        List<String> names = bucketService.getBucketContentNames();
        if (!names.isEmpty()) {
            return ResponseEntity.ok(new ResponseClass("OK", names));
        }
        return ResponseEntity.noContent().build();
    }
}
