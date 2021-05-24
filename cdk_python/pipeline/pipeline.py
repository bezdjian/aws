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
        pre_prod = ServerlessStackStage(self, 'Pre-Prod')
        pre_prod_stage = pipeline.add_application_stage(pre_prod)
        # Add validation
        pre_prod_stage.add_actions(ShellScriptAction(action_name='test-pre-prod-lambda-url',
                                                     use_outputs={
                                                         # Exposes outputs to be used in the same stage
                                                         "ENDPOINT_URL": pipeline.stack_output(
                                                             cfn_output=pre_prod.api_url_output
                                                         )
                                                     },
                                                     commands=['curl -Ssf $ENDPOINT_URL']
                                                     ))
