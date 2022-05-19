import aws_cdk as core
import aws_cdk.assertions as assertions

from cdk.product_api_stack import ProductApiStack


# example tests. To run these tests, uncomment this file along with the example
# resource in cdk/product_api_stack.py
def test_ecs_fargate_created():
    app = core.App()
    stack = ProductApiStack(app, "cdk")
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties("AWS::ECS::Service", {
        "LaunchType": "FARGATE"
    })
