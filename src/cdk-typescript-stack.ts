import * as lambda from '@aws-cdk/aws-lambda';
import * as api from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { CfnOutput } from '@aws-cdk/core';

export class CdkTypescriptStack extends cdk.Stack {
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
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdafunction')),
      functionName: 'CdkHelloFn',
      environment: {
        DB_TABLE: dynamoTable.tableName
      }
    });
    //OR. Add DynamoDB table name to Lambda environment variable
    //fn.addEnvironment('DBTABLE', dynamoTable.tableName);

    // Grant read access to lambda function
    dynamoTable.grantReadData(fn)

    // Create API Gateway with GET method triggering Lambda function
    const gateway = new api.LambdaRestApi(this, "HelloFnApi", {
      handler: fn,
      restApiName: 'HelloFnApi',
      description: 'Api gateway created by CDK for HelloFn Lambda',
      proxy: false
    });

    gateway.root.addMethod('GET')
    gateway.root.addResource('scan')

    // Expose api url to output
    new CfnOutput(this, 'ScanApiGatewayUrl', {
      value: gateway.url,
      exportName: 'ScanApiGatewayUrl'
    })
  }
}
