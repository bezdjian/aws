package com.example.awsspring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class AwsSpringApplication extends SpringBootServletInitializer{

    public static void main(String[] args) {
        SpringApplication.run(AwsSpringApplication.class, args);
    }

}
