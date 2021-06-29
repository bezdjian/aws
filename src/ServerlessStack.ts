import * as lambda from '@aws-cdk/aws-lambda';
import * as api from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { CfnOutput } from '@aws-cdk/core';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB
    const tableName = 'cdkTable'
    let dynamoTable = new Table(this, "CdkDynamoDBTable", {
      tableName,
      partitionKey: {name: 'id', type: AttributeType.STRING},
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create Lambda function with an existing handler
    const fn = new lambda.Function(this, "HelloFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./resource'),
      functionName: 'CdkHelloFn',
      environment: {
        DB_TABLE: dynamoTable.tableName
      }
    });
    
    // Grant read access to lambda function
    dynamoTable.grantReadData(fn)

    // Create API Gateway with GET method triggering Lambda function
    const gateway = new api.LambdaRestApi(this, "HelloFnApi", {
      handler: fn,
      restApiName: 'HelloFnApi',
      description: 'Api gateway created by CDK for HelloFn Lambda',
      proxy: false
    });

    gateway.root.resourceForPath('scan').addMethod('GET', new api.LambdaIntegration(fn));

    // Expose api url to output
    new CfnOutput(this, 'ScanApiGatewayUrl', {
      value: gateway.url,
      exportName: 'ScanApiGatewayUrl'
    })
  }
}
