from aws_cdk import core as cdk
from cdk_python.serverless_stack import ServerlessStack


def test_lambda_handler():
    # Given
    app = cdk.App()
    # When
    ServerlessStack(app, 'testStack')
    # Then
    template = app.synth().get_stack_by_name('testStack').template

    # resources = list(template['Resources'].values())
    # print('Resources: ', resources[0]['Type'])

    functions = [resource for resource in template['Resources'].values()
                 if resource['Type'] == 'AWS::Lambda::Function']

    tables = [resource for resource in template['Resources'].values()
              if resource['Type'] == 'AWS::DynamoDB::Table']

    assert len(functions) == 1
    assert len(tables) == 1
    assert functions[0]['Properties']['Handler'] == 'function.handler'
    assert tables[0]['Properties']['TableName'] == 'cdkPythonTable'
