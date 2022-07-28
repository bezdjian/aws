import logging

logger = logging.getLogger(__name__)
logger.setLevel(level=logging.INFO)


def handler(event, context):
    logger.info("Order function event: %s", event)

    try:
        event_body = event["body"]
        logger.info("event_body: %s", event_body)

        input_status = event_body["status"]
        input_price = event_body["price"]
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
