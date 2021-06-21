from aws_cdk import core as cdk
from lambda_kinesis_stack.kinesis_serverless_stack import KinesisServerlessStack


def test_stack():
    # Given
    app = cdk.App()
    # When
    KinesisServerlessStack(app, 'testStack')
    # Then
    template = app.synth().get_stack_by_name('testStack').template

    # resources = list(template['Resources'].values())
    # print('Resources: ', resources[0]['Type'])

    functions = [resource for resource in template['Resources'].values()
                 if resource['Type'] == 'AWS::Lambda::Function']

    tables = [resource for resource in template['Resources'].values()
              if resource['Type'] == 'AWS::DynamoDB::Table']

    stream = [resource for resource in template['Resources'].values()
              if resource['Type'] == 'AWS::KinesisFirehose::DeliveryStream']

    assert len(functions) == 1
    assert len(tables) == 1
    assert len(stream) == 1
    assert functions[0]['Properties']['Handler'] == 'process.handler'
    assert tables[0]['Properties']['TableName'] == 'KinesisDataTable'
    assert stream[0]['Properties']['DeliveryStreamName'] == 'CarDataStream'
