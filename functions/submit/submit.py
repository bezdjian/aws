import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(level=logging.INFO)


def handler(event, context):
    logger.info("Simple Function Event: %s", event)

    try:
        history_table = os.environ.get("history_table")

        transaction_type = event["transactionType"]
        product = event["product"]
        merchant_id = event["merchantId"]
        transaction_id = event["transaction_id"]

        dynamo_db = boto3.resource("dynamodb")
        table = dynamo_db.Table(history_table)

        logger.info("transaction_type: %s", transaction_type)
        # Initiate response body
        items = {
            "merchantId": merchant_id
        }

        if transaction_type == "ORDER":
            # code to put and prepare an order..
            items["status"] = "ORDER"
            items["price"] = "23995"
            items["transaction_id"] = transaction_id
            items["transaction_type"] = transaction_type
            items["merchant_id"] = merchant_id
            items["information"] = {
                'product': product,
                'price': '23995'
            }
            table_response = table.put_item(Item=items)
            logger.info("Response from Table: %s", table_response)
        elif transaction_type == "CANCEL":
            # code to retrieve and cancel an order..
            items["status"] = "CANCEL"
            items["price"] = "0"
        else:
            items["status"] = "NONE"

        response = {"body": items}
        logger.info("Returning %s", response)
        return response
    except ClientError as c:
        logger.exception(
            "Error occurred: %s.", c)
        raise
    except KeyError as k:
        logger.exception("Missing parameter! %s", k)
        return {
            "statusCode": "400",
            "message": f"Missing parameter: {k}"
        }
