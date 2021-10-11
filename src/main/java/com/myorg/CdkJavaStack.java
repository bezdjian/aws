package com.myorg;

import org.jetbrains.annotations.NotNull;
import software.amazon.awscdk.core.*;
import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.dynamodb.TableProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.amazon.awscdk.services.ssm.ParameterType;
import software.amazon.awscdk.services.ssm.StringParameter;
import software.amazon.awscdk.services.ssm.StringParameterProps;

import java.io.File;

public class CdkJavaStack extends Stack {
    public CdkJavaStack(final Construct scope, final String id) {
        super(scope, id);
    }

    public CdkJavaStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        Function function = createLambdaFunction();

        String tableName = "cdkTable-java";
        Table dynamoTable = createDynamoDBTable(tableName);

        dynamoTable.grantReadData(function);

        function.addEnvironment("DB_TABLE", tableName);

        LambdaRestApi restApi = createServiceRestApi(function);

        String parameterName = "/cdk/testParam";
        StringParameter stringParameter = createSsmParameter(parameterName);

        stringParameter.grantRead(function);
        function.addEnvironment("SSM_PARAM_NAME", parameterName);

        createCfnOutput("LambdaServiceArn", function.getFunctionArn());
        createCfnOutput("LambdaServiceUrl", restApi.getUrl());
    }

    @NotNull
    private StringParameter createSsmParameter(String parameterName) {
        return new StringParameter(this, parameterName, StringParameterProps.builder()
                .parameterName(parameterName)
                .stringValue("cdk-test-param-value")
                .type(ParameterType.STRING)
                .description("SSM created by CDK-java")
                .build());
    }

    @NotNull
    private LambdaRestApi createServiceRestApi(Function function) {
        LambdaRestApi restApi = LambdaRestApi.Builder.create(this, "CdkJavaHelloApi")
                .restApiName("CdkJavaHelloApi")
                .description("Rest API created by CDK for NodeHelloFunction")
                .handler(function)
                .proxy(false)
                .build();
        // Add GET method with lambda integration
        restApi.getRoot().addMethod("GET");
        return restApi;
    }

    @NotNull
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
        File projectDir = new File(System.getProperty("user.dir"));
        String myServiceFolderPath = new File(projectDir, "lambda-service").toString();
        return Function.Builder.create(this, "CdkJavaHelloFunction")
                .functionName("CdkJavaFunction")
                .handler("cdklambda.App::handleRequest")
                .runtime(Runtime.JAVA_11)
                .code(Code.fromAsset(myServiceFolderPath))
                .description("Lambda function for AWS CDK")
                .timeout(Duration.seconds(thirtySeconds))
                .memorySize(memorySizeInMB)
                .build();
    }

    private void createCfnOutput(String id, String value) {
        new CfnOutput(this, id, CfnOutputProps.builder()
                .value(value)
                .build());
    }
}
