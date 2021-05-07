package com.myorg;

import software.amazon.awscdk.core.CfnTag;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.dynamodb.TableProps;
import software.amazon.awscdk.services.ec2.CfnInstance;
import software.amazon.awscdk.services.ec2.CfnInstanceProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ec2.MachineImage;
import software.amazon.awscdk.services.ec2.MachineImageConfig;
import software.amazon.awscdk.services.ec2.Peer;
import software.amazon.awscdk.services.ec2.Port;
import software.amazon.awscdk.services.ec2.SecurityGroup;
import software.amazon.awscdk.services.ec2.SecurityGroupProps;
import software.amazon.awscdk.services.ec2.Vpc;
import software.amazon.awscdk.services.ec2.VpcAttributes;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.util.Collections;

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

        IVpc defaultVpc = Vpc.fromVpcAttributes(this, "VPC", VpcAttributes.builder()
            .vpcId("vpc-4f569826")
            .availabilityZones(Collections.singletonList("eu-north-1a"))
            .build());

        final Number sshPort = 22;
        SecurityGroup ec2SecurityG = new SecurityGroup(this, "EC2SecurityG", SecurityGroupProps.builder()
            .description("SG created by CDK for EC2InstanceForCdk")
            .securityGroupName("EC2InstanceForCdk-SG")
            .vpc(defaultVpc)
            .allowAllOutbound(false)
            .build());

        // Add Inbound rules to SG
        ec2SecurityG.addEgressRule(Peer.anyIpv4(), Port.tcp(sshPort), "Add SSH from anywhere");

        // Get latest Amazon Linux machine image
        MachineImageConfig latestAmazonLinuxImage = MachineImage.latestAmazonLinux().getImage(this);
        // Create Name tag for EC2
        CfnTag ec2Tag = CfnTag.builder()
            .key("Name").value("EC2InstanceForCdk")
            .build();

        // Build EC2.. for testing
        new CfnInstance(this, "EC2InstanceCdk", CfnInstanceProps.builder()
            .imageId(latestAmazonLinuxImage.getImageId())
            // .pem key name -> .keyName("Name")
            .securityGroupIds(Collections.singletonList(ec2SecurityG.getSecurityGroupId()))
            .instanceType("t3.micro")
            .tags(Collections.singletonList(ec2Tag))
            .build());
    }
}
