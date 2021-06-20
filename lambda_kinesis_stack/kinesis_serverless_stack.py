from aws_cdk import (core as cdk,
                     aws_lambda,
                     aws_apigateway,
                     aws_dynamodb,
                     aws_iam,
                     aws_kinesisfirehose as firehose,
                     aws_s3)


class KinesisServerlessStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 Bucket for kinesis firehose
        s3 = aws_s3.Bucket(self, 'KinesisFirehoseDataBucket',
                           bucket_name='kinesis-firehose-data-bucket',
                           removal_policy=cdk.RemovalPolicy.DESTROY)

        # Kinesis role for S3
        role = aws_iam.Role(self, 'KinesisS3Role',
                            role_name='KinesisS3Role',
                            assumed_by=aws_iam.ServicePrincipal('firehose.amazonaws.com'),
                            description='An S3 role for Kinesis to put data')

        # Kinesis firehose
        k_firehose = firehose.CfnDeliveryStream(self, 'CarDataStream',
                                                delivery_stream_name='CarDataStream',
                                                delivery_stream_type='DirectPut',
                                                s3_destination_configuration=
                                                firehose.CfnDeliveryStream.S3DestinationConfigurationProperty(
                                                    bucket_arn=s3.bucket_arn,
                                                    role_arn=role.role_arn
                                                ))

        # DynamoDB to save data from Kinesis.
        table_name = 'KinesisDataTable'
        table = aws_dynamodb.Table(self, 'KinesisDataTable',
                                   table_name=table_name,
                                   partition_key=aws_dynamodb.Attribute(
                                       name='id',
                                       type=aws_dynamodb.AttributeType.STRING
                                   ),
                                   removal_policy=cdk.RemovalPolicy.DESTROY)

        function = aws_lambda.Function(self, 'KinesisProcessorFunction',
                                       function_name='KinesisProcessorFunction',
                                       handler='process.handler',
                                       code=aws_lambda.Code.asset('./process_function'),
                                       runtime=aws_lambda.Runtime.PYTHON_3_8,
                                       environment={
                                           'DB_TABLE': table_name,
                                           'STREAM_NAME': k_firehose.delivery_stream_name
                                       })

        # Grant function to write data to Table
        table.grant_read_write_data(function)

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
