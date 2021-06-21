from aws_cdk import (core as cdk,
                     aws_lambda,
                     aws_lambda_event_sources as event_sources,
                     aws_apigateway,
                     aws_dynamodb,
                     aws_kinesis as kinesis)


class KinesisServerlessStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Kinesis Stream
        stream = kinesis.Stream(self, 'CarDataStream',
                                stream_name='CarDataStream',
                                shard_count=1)

        # DynamoDB to save data from Kinesis.
        table_name = 'KinesisDataTable'
        table = aws_dynamodb.Table(self, 'KinesisDataTable',
                                   table_name=table_name,
                                   partition_key=aws_dynamodb.Attribute(
                                       name='id',
                                       type=aws_dynamodb.AttributeType.STRING
                                   ),
                                   removal_policy=cdk.RemovalPolicy.DESTROY)

        # Lambda Kinesis stream data processor function
        function = aws_lambda.Function(self, 'KinesisProcessorFunction',
                                       function_name='KinesisProcessorFunction',
                                       handler='process.handler',
                                       code=aws_lambda.Code.asset('./process_function'),
                                       runtime=aws_lambda.Runtime.PYTHON_3_8,
                                       environment={
                                           'DB_TABLE': table_name,
                                           'STREAM_NAME': stream.stream_name
                                       },
                                       timeout=cdk.Duration.seconds(30))

        # Grant function to write data to Table
        table.grant_read_write_data(function)
        # Grant function to read stream data
        stream.grant_read(function)
        # Add event source Kinesis stream
        kinesis_event_source = event_sources.KinesisEventSource(stream,
                                                                starting_position=aws_lambda.StartingPosition.LATEST)
        function.add_event_source(kinesis_event_source)

        # Api gateway
        api_gateway = aws_apigateway.LambdaRestApi(self, 'KinesisProcessorApi',
                                                   handler=function,
                                                   proxy=False,
                                                   rest_api_name='KinesisProcessorApi')
        # Add resource and method to the API
        api_gateway.root.add_resource('process').add_method('GET')

        self.url_output = cdk.CfnOutput(self, 'KinesisProcessorApiUrl',
                                        value=api_gateway.url,
                                        export_name='KinesisProcessorApiUrl')
