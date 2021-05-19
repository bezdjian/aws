package com.myorg;

import software.amazon.awscdk.core.CfnOutput;
import software.amazon.awscdk.core.CfnOutputProps;
import software.amazon.awscdk.core.CfnTag;
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
import software.amazon.awscdk.services.ssm.ParameterType;
import software.amazon.awscdk.services.ssm.StringParameter;
import software.amazon.awscdk.services.ssm.StringParameterProps;

import java.util.Collections;

public class CdkJavaEC2Stack {

    public CdkJavaEC2Stack(CdkJavaServerlessStack stack) {

        IVpc defaultVpc = Vpc.fromVpcAttributes(stack, "VPC", VpcAttributes.builder()
            .vpcId("vpc-4f569826")
            .availabilityZones(Collections.singletonList("eu-north-1a"))
            .build());

        final Number sshPort = 22;
        SecurityGroup ec2SecurityG = new SecurityGroup(stack, "EC2SecurityG", SecurityGroupProps.builder()
            .description("SG created by CDK for EC2InstanceForCdk")
            .securityGroupName("EC2InstanceForCdk-SG")
            .vpc(defaultVpc)
            .allowAllOutbound(false)
            .build());

        // Add Inbound rules to SG
        ec2SecurityG.addEgressRule(Peer.anyIpv4(), Port.tcp(sshPort), "Add SSH from anywhere");

        // Get latest Amazon Linux machine image
        MachineImageConfig latestAmazonLinuxImage = MachineImage.latestAmazonLinux().getImage(stack);
        // Create Name tag for EC2
        CfnTag ec2Tag = CfnTag.builder()
            .key("Name").value("EC2InstanceForCdk")
            .build();

        // Build EC2.. for testing
        CfnInstance ec2Instance = new CfnInstance(stack, "EC2InstanceCdk", CfnInstanceProps.builder()
            .imageId(latestAmazonLinuxImage.getImageId())
            // .pem key name -> .keyName("Name")
            .securityGroupIds(Collections.singletonList(ec2SecurityG.getSecurityGroupId()))
            .instanceType("t3.micro")
            .tags(Collections.singletonList(ec2Tag))
            .build());

        // Create SSM parameter
        String parameterName = "/cdk/testParam";
        StringParameter cdktestParam = new StringParameter(stack, parameterName, StringParameterProps.builder()
            .parameterName(parameterName)
            .stringValue("cdk-test-param-value")
            .type(ParameterType.STRING)
            .description("SSM created by CDK-java")
            .build());

        cdktestParam.grantRead(stack.getLambdaFunction());
        stack.getLambdaFunction().addEnvironment("SSM_PARAM_NAME", parameterName);

        // Read while cdk deploy
        //String cdkTestParamValue = StringParameter.valueForStringParameter(this, "CdkTestParam");
        // Read while cdk synth
        //String cdkTestParamValue = StringParameter.valueFromLookup(this, parameterName);
        //System.out.println("cdkTestParamValue: " + cdkTestParamValue);

        //1 CfnOutput for each Resource we want to output?
        createCfnOutput(stack, "EC2InstanceDNSName", ec2Instance.getAttrPublicDnsName());
    }

    private void createCfnOutput(CdkJavaServerlessStack stack, String id, String value) {
        new CfnOutput(stack, id, CfnOutputProps.builder()
            .value(value)
            .build());
    }
}
