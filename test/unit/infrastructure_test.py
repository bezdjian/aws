from aws_cdk import core as cdk

from step_functions_stack import StepFunctionsStack


def test_infrastructure():
    # Given
    app = cdk.App()
    # When
    stack_name = "StepFunctions"
    StepFunctionsStack(app, stack_name)
    # Then
    template = app.synth().get_stack_by_name(stack_name).template

    functions = [resource for resource in template['Resources'].values()
                 if resource['Type'] == 'AWS::Lambda::Function']

    # 4 lambda functions are expected
    assert (len(functions) == 4)
