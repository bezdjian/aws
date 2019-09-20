package com.example.awsspring.dto;

import lombok.*;

import java.util.List;

@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ResponseClass {

    private String message;
    private List<String> bucketContentNames;

}
