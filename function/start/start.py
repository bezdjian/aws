import json
import logging
import os
import uuid

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def handler(event, context):
    print("Start Function Event: ")
    print(event)
    body = json.loads(event["body"])
    print("body: ", body)

    state_machine_arn = os.environ.get("state_machine_arn")
    state_machine_name = os.environ.get("state_machine_name")

    try:
        transaction_type = body["transactionType"]
        merchant_id = body["merchantId"]
        product = body["product"]

        step_functions_client = boto3.client('stepfunctions')

        # TODO: Make it dynamic! read it from event?
        output = {
            "transactionType": transaction_type,
            "product": product,
            "merchantId": merchant_id
        }

        step_functions_client.start_execution(
            stateMachineArn=state_machine_arn,
            name=str(uuid.uuid4()),
            input=json.dumps(output),
            traceHeader='string'
        )

        print("output: ", output)
        return {
            "statusCode": "200"
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
