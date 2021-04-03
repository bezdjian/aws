import * as lambda from '@aws-cdk/aws-lambda';
import * as api from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

export class CdkTypescriptStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const fn = new lambda.Function(this, "HelloFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdafunction')),
      functionName: 'CdkHelloFn'
    });

    const gateway = new api.LambdaRestApi(this, "HelloFnApi", {
      handler: fn,
      restApiName: 'HelloFnApi',
      description: 'Api gateway created by CDK for HelloFn Lambda',
      proxy: false
    });

    gateway.root.addMethod('GET')
  }
}
