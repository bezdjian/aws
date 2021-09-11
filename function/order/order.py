import logging

logger = logging.getLogger(__name__)


def handler(event, context):
    logger.info("Result Function Event: ")
    logger.info(event)
    input_body = event["body"]
    logger.info("input_body: ", input_body)

    input_status = input_body["status"]
    input_price = input_body["price"]
    logger.info("input_status: ", input_status)
    status = "NONE"

    try:
        # Complete the order
        # code ...
        status = "COMPLETED"

    except Exception as e:
        logger.exception("Error occurred: ", e)
        status = "ERROR"

    logger.info("Status: ", status)
    return status
