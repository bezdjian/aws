import logging
import json

logger = logging.getLogger(__name__)
logger.setLevel(level=logging.INFO)


def handler(event, context):
    logger.info("Result Function Event: %s", event)

    try:
        input_body = json.loads(event["body"])
        logger.info("input_body: %s", input_body)

        input_status = input_body["status"]
        input_price = input_body["price"]
        logger.info("input_status: %s", input_status)
        logger.info("input_price: %s", input_price)
        # Complete the order
        # code ...
        status = "COMPLETED"

    except Exception as e:
        logger.exception("Error occurred: %s", e)
        status = "ERROR"

    logger.info("Status: %s", status)
    return status
