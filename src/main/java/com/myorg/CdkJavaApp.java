package com.myorg;

import software.amazon.awscdk.core.App;
import software.amazon.awscdk.core.Environment;
import software.amazon.awscdk.core.StackProps;

public class CdkJavaApp {

    public static void main(final String[] args) {
        App app = new App();
        CdkJavaServerlessStack serverlessStack = new CdkJavaServerlessStack(app, 
                "CdkJavaStack", 
                getCdkStackProps());
        new CdkJavaEC2Stack(serverlessStack);
        app.synth();
    }

    private static StackProps getCdkStackProps() {
        return StackProps.builder()
            .description("Stack created by CDK with Java")
            .env(buildEnvironment())
            .stackName("CdkJavaStack")
            .build();
    }

    private static Environment buildEnvironment() {
        return Environment.builder()
            .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
            .region(System.getenv("CDK_DEFAULT_REGION"))
            .build();
    }
}