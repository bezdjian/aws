from aws_cdk import (
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    Stack
)
from constructs import Construct


class ProductApiStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create VPC and Fargate Cluster
        # NOTE: Limit AZs to avoid reaching resource quotas
        vpc = ec2.Vpc(
            self, "Vpc",
            max_azs=2,
        )

        cluster = ecs.Cluster(
            self, 'ProductApiCluster',
            cluster_name="ProductApiCluster-test",
            vpc=vpc
        )

        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ProductApiService",
            cluster=cluster,
            public_load_balancer=True,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset(directory="../product-api")
            )
        )

        fargate_service.target_group.configure_health_check(enabled=True,
                                                            path="/actuator/health")

        fargate_service.service.connections.security_groups[0].add_ingress_rule(
            peer=ec2.Peer.ipv4(vpc.vpc_cidr_block),
            connection=ec2.Port.tcp(80),
            description="Allow http inbound from VPC"
        )
