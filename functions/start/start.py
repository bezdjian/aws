import distutils.util
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
    history_table = os.environ.get("history_table")

    test = bool(distutils.util.strtobool(
        os.environ.get("test")
    ))

    try:
        body = json.loads(event["body"])
        logger.info("body: %s", body)

        transaction_type = body["transactionType"]
        merchant_id = body["merchantId"]
        product = body["product"]

        step_functions_client = boto3.client('stepfunctions')
        dynamo_db = boto3.resource("dynamodb")
        table = dynamo_db.Table(history_table)

        transaction_id = str(uuid.uuid4())

        execution_input = {
            "transaction_id": transaction_id,
            "transactionType": transaction_type,
            "product": product,
            "merchantId": merchant_id
        }

        if not test:
            logger.info("Running state machine %s with execution input %s", state_machine_name, execution_input)
            step_functions_client.start_execution(
                stateMachineArn=state_machine_arn,
                name=transaction_id,
                input=json.dumps(execution_input),
                traceHeader='string'
            )

            response = table.put_item(
                Item={
                    'id': transaction_id,
                    'transaction_type': transaction_type,
                    'merchant_id': merchant_id,
                    'information': {
                        'product': product
                    }
                }
            )

            logger.info("Response from Table: %s", response)
        else:
            logger.info("Test is enabled. Skipping start of state machine %s", state_machine_name)

        return {
            "statusCode": "200",
            "body": json.dumps({
                "message": f"State machine {state_machine_name} started with input {execution_input}",
                "test_env": test
            })
        }
    except ClientError as c:
        logger.exception(
            "Error occurred while running state machine %s: %s.", state_machine_name, c)
        raise
    except KeyError as k:
        logger.exception("Missing parameter! %s", k)
        return {
            "statusCode": "400",
            "message": f"Missing parameter: {k}"
        }
