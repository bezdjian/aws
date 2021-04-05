package com.myorg;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.util.HashMap;
import java.util.Map;

public class CdkJavaStack extends Stack {
    public CdkJavaStack(final Construct scope, final String id) {
        super(scope, id);
    }

    public CdkJavaStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        // Build the Lambda function
        Function function = Function.Builder.create(this, "CdkJavaHelloFunction")
            .functionName("java-hello-cdk")
            .handler("hello.handler")
            .runtime(Runtime.NODEJS_10_X)
            .code(Code.fromAsset("lambdafunction"))
            .environment(createLambdaEnvVariables())
            .build();

        // Build the rest API
        LambdaRestApi restApi = LambdaRestApi.Builder.create(this, "CdkJavaHelloApi")
            .restApiName("CdkJavaHelloApi")
            .description("Rest API created by CDK for NodeHelloFunction")
            .handler(function)
            .proxy(false)
            .build();

        // Add GET method with lambda integration
        restApi.getRoot().addMethod("GET");
    }

    private Map<String, String> createLambdaEnvVariables() {
        HashMap<String, String> lambdaEnvironment = new HashMap<>();
        lambdaEnvironment.put("SOMEENV", "SOMEVAR");
        return lambdaEnvironment;
    }
}
