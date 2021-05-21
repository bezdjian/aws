from aws_cdk import (core as cdk, aws_lambda)


class CdkPythonStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create lambda function
        function = aws_lambda.Function(self, 'LambdaFunction',
                                       handler='function.handler',
                                       function_name='simple-function',
                                       runtime=aws_lambda.Runtime.PYTHON_3_8,
                                       code=aws_lambda.Code.asset("./lambda"))
