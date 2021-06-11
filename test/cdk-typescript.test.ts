import {expect as expectCdk, haveResource, SynthUtils,} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import {CdkTypescriptStack} from "../src/cdk-typescript-stack";

test("Stack has correct resources", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkTypescriptStack(app, 'MyTestStack');
  // THEN
  expectCdk(stack).to(haveResource("AWS::Lambda::Function"));
  expectCdk(stack).to(haveResource("AWS::DynamoDB::Table"));
});

test("Stack matches snapshot", () => {
  const app = new cdk.App();
  //const stack = new CdkTypescript.CdkTypescriptStack(app, 'TestStack');
  const stack = new CdkTypescriptStack(app, 'MyTestStack');
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
