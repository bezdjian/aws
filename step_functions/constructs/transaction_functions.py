from aws_cdk import (
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    CfnOutput
)
from constructs import Construct

class TransactionFunctions(Construct):
    def __init__(self, scope: Construct, construct_id: str):
        super().__init__(scope, construct_id)

        self.start_function = _lambda.Function(self, "StartTransactionFunction",
                                           code=_lambda.Code.from_asset("functions/start"),
                                           runtime=_lambda.Runtime.PYTHON_3_12,
                                           handler="start.handler")

        self.submit_function = _lambda.Function(self, "SubmitTransactionFunction",
                                            code=_lambda.Code.from_asset("functions/submit"),
                                            runtime=_lambda.Runtime.PYTHON_3_12,
                                            handler="submit.handler")

        self.order_function = _lambda.Function(self, "OrderFunction",
                                           code=_lambda.Code.from_asset("functions/order"),
                                           runtime=_lambda.Runtime.PYTHON_3_12,
                                           handler="order.handler")

        self.cancel_function = _lambda.Function(self, "CancelFunction",
                                            code=_lambda.Code.from_asset("functions/cancel"),
                                            runtime=_lambda.Runtime.PYTHON_3_12,
                                            handler="cancel.handler")

        # API Gateway to trigger the start function
        request_templates = {
            "application/json": '{ "statusCode": "200" }'
        }

        sf_integration = apigateway.LambdaIntegration(self.start_function,
                                               request_templates=request_templates)
        execution_api = apigateway.RestApi(self, "StartExecutionAPI",
                                    rest_api_name="StartExecutionAPI")

        execution_api.root.add_resource("execute").add_method("POST", sf_integration)

        # Output API Gateways url
        CfnOutput(scope, "StartExecutionAPI-URL",
                  value=execution_api.url)
