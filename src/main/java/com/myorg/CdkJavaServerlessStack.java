package com.myorg;

import software.amazon.awscdk.core.BundlingOptions;
import software.amazon.awscdk.core.BundlingOutput;
import software.amazon.awscdk.core.CfnOutput;
import software.amazon.awscdk.core.CfnOutputProps;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.DockerVolume;
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
import software.amazon.awscdk.services.s3.assets.AssetOptions;

import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class CdkJavaServerlessStack extends Stack {

    private Function myServiceFunction;

    public CdkJavaServerlessStack(final Construct scope, String id) {
        super(scope, id);
    }

    public CdkJavaServerlessStack(final Construct scope, String id, final StackProps props) {
        super(scope, id, props);

        myServiceFunction = createLambdaFunction();

        // Build DynamoDB
        String tableName = "cdkTable-java";
        Table dynamoTable = createDynamoDBTable(tableName);

        // Grant read access to Lambda function
        dynamoTable.grantReadData(myServiceFunction);

        // Add table name to Lambda's environment variables.
        myServiceFunction.addEnvironment("DB_TABLE", tableName);

        // Build the rest API
        LambdaRestApi myServiceRestApi = buildMyServiceRestApi();

        //Output myService function ARN & URL
        createCfnOutput("LambdaFunctionArn", myServiceFunction.getFunctionArn());
        createCfnOutput("LambdaFunctionURL", myServiceRestApi.getUrl());
    }

    private LambdaRestApi buildMyServiceRestApi() {
        LambdaRestApi restApi = LambdaRestApi.Builder.create(this, "CdkJavaHelloApi")
            .restApiName("CdkJavaHelloApi")
            .description("Rest API created by CDK for NodeHelloFunction")
            .handler(myServiceFunction)
            .proxy(false)
            .build();
        // Add GET method with lambda integration
        restApi.getRoot().addMethod("GET");

        return restApi;
    }

    private Table createDynamoDBTable(String tableName) {
        return new Table(this, "cdkTable-java", TableProps.builder()
            .partitionKey(Attribute.builder()
                .name("id")
                .type(AttributeType.STRING)
                .build())
            .tableName(tableName)
            .build());
    }

     private Function createLambdaFunction() {

        Number thirtySeconds = 30;
        Number memorySizeInMB = 512;

        String lambdaServiceFolderPath = getMyServiceFolderPath();
        BundlingOptions bundlingOptions = createBundlingOptions();

        return Function.Builder.create(this, "CdkJavaHelloFunction")
            .functionName("CdkJavaFunction")
            .handler("cdklambda.App::handleRequest")
            .runtime(Runtime.JAVA_11)
            .code(Code.fromAsset(lambdaServiceFolderPath,
                AssetOptions.builder()
                    .bundling(bundlingOptions)
                    .build()))
            .description("Lambda function for AWS CDK")
            .timeout(Duration.seconds(thirtySeconds))
            .memorySize(memorySizeInMB)
            .build();
    }

    private String getMyServiceFolderPath() {
        File projectDir = new File(System.getProperty("user.dir"));
        return new File(projectDir, "lambdafunction/").toString();
    }

    private BundlingOptions createBundlingOptions() {
        DockerVolume dockerVolume = createDockerVolume();
        List<String> dockerCommand = createDockerCommands();
        return BundlingOptions.builder()
                .command(dockerCommand)
                .image(Runtime.JAVA_11.getBundlingImage())
                .user("root")
                .volumes(Collections.singletonList(dockerVolume))
                .outputType(BundlingOutput.ARCHIVED)
                .build();
    }

    private DockerVolume createDockerVolume() {
        return DockerVolume.builder()
        .hostPath(System.getProperty("user.home") + "/.m2/")
        .containerPath("/root/.m2/")
        .build();
    }

    private List<String> createDockerCommands() {
        return Arrays.asList(
            "/bin/sh",
            "-c",
            "mvn clean install && " +
            "cp /asset-input/target/my-service-1.0.jar /asset-output/");
    }

    public Function getMyServiceFunction() {
        return myServiceFunction;
    }

    private void createCfnOutput(String id, String value) {
        new CfnOutput(this, id, CfnOutputProps.builder()
            .value(value)
            .build());
    }
}
