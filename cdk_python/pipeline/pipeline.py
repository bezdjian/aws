from aws_cdk import core as cdk
from aws_cdk.pipelines import CdkPipeline, SimpleSynthAction

import aws_cdk.aws_codepipeline as codepipeline
import aws_cdk.aws_codepipeline_actions as codepipeline_actions


class PipelineStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        source_artifact = codepipeline.Artifact('sourceArtifact')
        cloud_assembly_artifact = codepipeline.Artifact()

        pipeline = CdkPipeline(self, 'CdkPythonPipeline',
                               pipeline_name='CdkPythonPipeline',
                               cloud_assembly_artifact=cloud_assembly_artifact,
                               source_action=codepipeline_actions.GitHubSourceAction(
                                   action_name='GitHub',
                                   output=source_artifact,
                                   oauth_token=cdk.SecretValue.secrets_manager("github-token"),
                                   trigger=codepipeline_actions.GitHubTrigger.POLL,
                                   owner='bezdjian',
                                   branch='cdk-python-lambda-api',
                                   repo='aws'),
                               synth_action=SimpleSynthAction.standard_npm_synth(
                                   source_artifact=source_artifact,
                                   cloud_assembly_artifact=cloud_assembly_artifact,
                                   install_command="pip install -r requirements.txt",
                                   synth_command="cdk synth")
                               )
