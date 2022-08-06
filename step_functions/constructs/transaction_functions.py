from aws_cdk import (
    core as cdk,
    aws_lambda as lmb,
    aws_apigateway as api)

start_function = None
submit_function = None
order_function = None
cancel_function = None


class TransactionFunctions(cdk.Construct):
    def __init__(self, scope: cdk.Construct, construct_id: str):
        super().__init__(scope, construct_id)

        self.start_function = lmb.Function(scope, "StartTransactionFunction",
                                           code=lmb.Code.from_asset("functions/start"),
                                           runtime=lmb.Runtime.PYTHON_3_9,
                                           handler="start.handler",
                                           function_name="StepFunction-StartTransaction")

        self.submit_function = lmb.Function(scope, "SubmitTransactionFunction",
                                            code=lmb.Code.from_asset("functions/submit"),
                                            runtime=lmb.Runtime.PYTHON_3_9,
                                            handler="submit.handler",
                                            function_name="StepFunction-SubmitTransaction")

        self.order_function = lmb.Function(scope, "OrderFunction",
                                           code=lmb.Code.from_asset("functions/order"),
                                           runtime=lmb.Runtime.PYTHON_3_9,
                                           handler="order.handler",
                                           function_name="StepFunction-Order")

        self.cancel_function = lmb.Function(scope, "CancelFunction",
                                            code=lmb.Code.from_asset("functions/cancel"),
                                            runtime=lmb.Runtime.PYTHON_3_9,
                                            handler="cancel.handler",
                                            function_name="StepFunction-Cancel")

        # API Gateway to trigger the start function
        request_templates = {
            "application/json": '{ "statusCode": "200" }'
        }

        sf_integration = api.LambdaIntegration(self.start_function,
                                               request_templates=request_templates)
        execution_api = api.RestApi(scope, "StartExecutionAPI",
                                    rest_api_name="StartExecutionAPI")

        execution_api.root.add_resource("execute").add_method("POST", sf_integration)

        # Output API Gateways url
        cdk.CfnOutput(scope, "StartExecutionAPI-URL",
                      value=execution_api.url)
