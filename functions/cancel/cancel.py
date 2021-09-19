import logging

logger = logging.getLogger(__name__)
logger.setLevel(level=logging.INFO)


def handler(event, context):
    logger.info("Result Function Event: %s", event)
    status = "NONE"

    try:
        input_body = event["body"]
        logger.info("input_body: %s", input_body)

        input_status = input_body["status"]
        input_price = input_body["price"]
        logger.info("input_status: %s", input_status)

        # Cancel the order
        # code ...
        status = "CANCELLED"

    except Exception as e:
        logger.exception("Error occurred: %s", e)
        status = "ERROR"

    logger.info("Status: %s", status)
    return status
