package com.myorg;

import software.amazon.awscdk.core.Construct;
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

public class CdkJavaStack extends Stack {
    public CdkJavaStack(final Construct scope, final String id) {
        super(scope, id);
    }

    public CdkJavaStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        // Build the Lambda function
        Function function = Function.Builder.create(this, "CdkJavaHelloFunction")
            .functionName("CdkJavaFunction")
            .handler("cdklambda.App::handleRequest")
            .runtime(Runtime.JAVA_11)
            .code(Code.fromAsset("lambdafunction/target/lambda-for-cdk-1.0.jar"))
            .description("Lambda function for AWS CDK")
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
        dynamoTable.grantReadData(function);

        // Add table name to Lambda's environment variables.
        function.addEnvironment("DB_TABLE", tableName);

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
}
