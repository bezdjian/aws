import {SynthUtils,} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import {CdkTypescriptStack} from "../src/cdk-typescript-stack";

test("Empty Stack", () => {
  //const app = new cdk.App();
  //// WHEN
  //const stack = new CdkTypescript.CdkTypescriptStack(app, 'MyTestStack');
  //// THEN
  //expectCDK(stack).to(matchTemplate({
  //  "Resources": {}
  //}, MatchStyle.EXACT))
});

test("Stack matches snapshot", () => {
  const app = new cdk.App();
  //const stack = new CdkTypescript.CdkTypescriptStack(app, 'TestStack');
  const stack = new CdkTypescriptStack(app, 'MyTestStack');
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
