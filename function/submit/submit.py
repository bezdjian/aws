import logging

logger = logging.getLogger(__name__)


def handler(event, context):
    logger.info("Simple Function Event: ")
    logger.info(event)

    transaction_type = event["transactionType"]
    product = event["product"]
    merchant_id = event["merchantId"]

    # Do something with input parameters...

    logger.info("transaction_type: ", transaction_type)
    # Initiate response body
    response_body = {
        "merchantId": merchant_id
    }

    if transaction_type == "ORDER":
        # code to put and prepare an order..
        response_body["status"] = "ORDER"
        response_body["price"] = "100"
    elif transaction_type == "CANCEL":
        # code to retrieve and cancel an order..
        response_body["status"] = "CANCEL"
        response_body["price"] = "0"
    else:
        response_body["status"] = "NONE"

    response = {"body": response_body}
    logger.info("Returning ", response)
    return response
