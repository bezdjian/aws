import json

import boto3

from utils import test


def lambda_handler(event, context):
    http_method = event.get("httpMethod")
    print(f"http_method: {http_method}")

    test()

    if http_method == "GET":
        return get_handler(event, context)
    elif http_method == "POST":
        return post_handler(event, context)
    else:
        return default_handler(event, context)


def get_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "GET hello world",
        }),
    }


def post_handler(event, context):
    # list tables from dynamodb
    body = json.loads(event.get("body"))
    external_id = body.get("externalId")
    print(f"external_id: {external_id}")

    dynamo = boto3.resource("dynamodb")
    table = dynamo.Table("vwdpeu-iot-apn-subscription-status_vw_vw_eu_iot")
    response = table.get_item(
        Key={
            'externalId': external_id
        }
    )
    print(f"response['Item']: {response}")
    item = response['Item']
    print(f"Item: -- {item}")

    status_type_result = item.get('statusType')
    external_id_result = item.get('externalId')
    print(f"statusType: {status_type_result}")

    body = {
        "statusType": status_type_result,
        "externalId": external_id_result
    }

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": body,
        }),
    }


def default_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Default hello world",
        }),
    }
