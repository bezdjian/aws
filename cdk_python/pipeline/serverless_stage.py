from ..serverless_stack import ServerlessStack
from aws_cdk import core as cdk


class ServerlessStackStage(cdk.Stage):
    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        service = ServerlessStack(self, 'ServerlessStack')

        # Expose API's url output one level higher
        self.api_url_output = service.url_output
