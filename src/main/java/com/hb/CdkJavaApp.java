package com.hb;

import software.amazon.awscdk.core.App;
import software.amazon.awscdk.core.Environment;
import software.amazon.awscdk.core.StackProps;

public class CdkJavaApp {

    public static void main(final String[] args) {
        App app = new App();

        new CdkJavaStack(app, "CdkJavaStack", StackProps.builder()
            .description("Stack created by CDK with Java")
            .env(buildEnvironment())
            .stackName("CdkJavaStack")
            .build());

        app.synth();
    }

    // Helper method to build an environment
    private static Environment buildEnvironment() {
        return Environment.builder()
            .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
            .region(System.getenv("CDK_DEFAULT_REGION"))
            .build();
    }
}