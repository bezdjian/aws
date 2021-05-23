from aws_cdk import core as cdk
from aws_cdk.pipelines import CdkPipeline, SimpleSynthAction, ShellScriptAction
from .serverless_stage import ServerlessStackStage

import aws_cdk.aws_codepipeline as codepipeline
import aws_cdk.aws_codepipeline_actions as codepipeline_actions


class PipelineStack(cdk.Stack):

    def __init__(self, scope: cdk.Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        # Output artifact
        source_artifact = codepipeline.Artifact()
        # Artifact to hold the cloudAssemblyArtifact for the synth action (the template)
        cloud_assembly_artifact = codepipeline.Artifact()

        pipeline = CdkPipeline(self, 'CdkPythonPipeline',
                               pipeline_name='CdkPythonPipeline',
                               cloud_assembly_artifact=cloud_assembly_artifact,
                               # The Source stage
                               source_action=codepipeline_actions.GitHubSourceAction(
                                   action_name='GitHub',
                                   output=source_artifact,
                                   oauth_token=cdk.SecretValue.secrets_manager("github-token"),
                                   trigger=codepipeline_actions.GitHubTrigger.POLL,
                                   owner='bezdjian',
                                   branch='cdk-python-lambda-api',
                                   repo='aws'),
                               # Creates a Build stage
                               synth_action=SimpleSynthAction.standard_npm_synth(
                                   source_artifact=source_artifact,
                                   cloud_assembly_artifact=cloud_assembly_artifact,
                                   install_command="npm install -g aws-cdk && pip install -r requirements.txt",
                                   build_command="pytest unittests",
                                   synth_command="cdk synth")
                               )
        # Add serverless stack to deployment with Pre-Prod stage
        pipeline.add_application_stage(ServerlessStackStage(self, 'Pre-Prod'))
        # Add test stage to run pytest
        pipeline.add_stage('Test') \
            .add_actions(ShellScriptAction(action_name='Pytest',
                                           commands=['python -m pytest unittests']))
