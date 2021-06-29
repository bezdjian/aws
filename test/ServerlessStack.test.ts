import { expect as expectCdk, haveResource, SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { ServerlessStack } from "../src/ServerlessStack";

test("Stack has correct resources", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ServerlessStack(app, "MyTestStack");
  // THEN
  expectCdk(stack).to(haveResource("AWS::Lambda::Function"));
  expectCdk(stack).to(haveResource("AWS::DynamoDB::Table"));
});

test("Stack matches snapshot", () => {
  const app = new cdk.App();
  const stack = new ServerlessStack(app, "MyTestStack");
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
