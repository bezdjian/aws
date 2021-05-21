from aws_cdk import (core as cdk, aws_lambda, aws_apigateway, aws_dynamodb)


class CdkPythonStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create Dynamo Table
        table_name = 'cdkPythonTable'
        table = aws_dynamodb.Table(self, table_name,
                                   table_name=table_name,
                                   partition_key=aws_dynamodb.Attribute(
                                       name='id',
                                       type=aws_dynamodb.AttributeType.STRING
                                   ))

        # Create lambda function
        function = aws_lambda.Function(self, 'LambdaFunction',
                                       handler='function.handler',
                                       function_name='simple-function',
                                       runtime=aws_lambda.Runtime.PYTHON_3_8,
                                       code=aws_lambda.Code.asset("./lambda"),
                                       environment={
                                           'DB_TABLE': table_name
                                       })

        # Grant function read on table
        table.grant_read_data(function)

        # Create API Gateway
        api = aws_apigateway.LambdaRestApi(self, 'APIGateway',
                                           proxy=False,
                                           handler=function,
                                           rest_api_name='APIGateway',
                                           description='Rest API for lambda function')
        # Add resource & method: GET /items
        items = api.root.add_resource('items')
        items.add_method('GET')
