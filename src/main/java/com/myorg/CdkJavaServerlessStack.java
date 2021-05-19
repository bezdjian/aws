package com.myorg;

import software.amazon.awscdk.core.CfnOutput;
import software.amazon.awscdk.core.CfnOutputProps;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Duration;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.dynamodb.TableProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.io.File;

public class CdkJavaServerlessStack extends Stack {

    private Function lambdaFunction;

    public CdkJavaServerlessStack(final Construct scope, String id) {
        super(scope, id);
    }

    public CdkJavaServerlessStack(final Construct scope, String id, final StackProps props) {
        super(scope, id, props);

        // Build the Lambda function
        Number thirtySeconds = 30;
        Number memorySizeInMB = 512;
        File projectDir = new File(System.getProperty("user.dir"));
        lambdaFunction = Function.Builder.create(this, "CdkJavaHelloFunction")
            .functionName("CdkJavaFunction")
            .handler("cdklambda.App::handleRequest")
            .runtime(Runtime.JAVA_11)
            .code(Code.fromAsset(new File(projectDir, "lambdafunction/target/lambda-for-cdk-1.0.jar").toString()))
            .description("Lambda function for AWS CDK")
            .timeout(Duration.seconds(thirtySeconds))
            .memorySize(memorySizeInMB)
            .build();

        // Build DynamoDB
        String tableName = "cdkTable-java";
        Table dynamoTable = new Table(this, "cdkTable-java", TableProps.builder()
            .partitionKey(Attribute.builder()
                .name("id")
                .type(AttributeType.STRING)
                .build())
            .tableName(tableName)
            .build());
        // Grant read access to Lambda function
        dynamoTable.grantReadData(lambdaFunction);

        // Add table name to Lambda's environment variables.
        lambdaFunction.addEnvironment("DB_TABLE", tableName);

        // Build the rest API
        LambdaRestApi restApi = LambdaRestApi.Builder.create(this, "CdkJavaHelloApi")
            .restApiName("CdkJavaHelloApi")
            .description("Rest API created by CDK for NodeHelloFunction")
            .handler(lambdaFunction)
            .proxy(false)
            .build();

        // Add GET method with lambda integration
        restApi.getRoot().addMethod("GET");

        //1 CfnOutput for each Resource we want to output?
        createCfnOutput("LambdaFunctionArn", lambdaFunction.getFunctionArn());
    }

    public Function getLambdaFunction() {
        return lambdaFunction;
    }

    private void createCfnOutput(String id, String value) {
        new CfnOutput(this, id, CfnOutputProps.builder()
            .value(value)
            .build());
    }
}
