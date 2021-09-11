import json
import logging
import os
import uuid

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(level=logging.INFO)


def handler(event, context):
    logger.info("Start Function Event: %s", event)

    state_machine_arn = os.environ.get("state_machine_arn")
    state_machine_name = os.environ.get("state_machine_name")

    try:
        body = json.loads(event["body"])
        logger.info("body: %s", body)

        transaction_type = body["transactionType"]
        merchant_id = body["merchantId"]
        product = body["product"]

        step_functions_client = boto3.client('stepfunctions')

        execution_input = {
            "transactionType": transaction_type,
            "product": product,
            "merchantId": merchant_id
        }

        step_functions_client.start_execution(
            stateMachineArn=state_machine_arn,
            name=str(uuid.uuid4()),
            input=json.dumps(execution_input),
            traceHeader='string'
        )

        return {
            "statusCode": "200",
            "body": json.dumps({
                "message": f"State machine started with input {execution_input}"
            })
        }
    except ClientError as c:
        logger.exception(
            "Couldn't get runs for state machine %s: %s.", state_machine_name, c)
        raise
    except KeyError as k:
        logger.exception("Missing parameter! %s", k)
        return {
            "statusCode": "400",
            "message": f"Missing parameter: {k}"
        }
