import json

import boto3
import os


def handler(event, context):
    print("event: ", event)

    table_name = os.getenv('DB_TABLE')
    print("Table: ", table_name)

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    items = table.scan()

    print('Items: ', items.get('Items'))

    return {
        'statusCode': 200,
        'body': json.dumps({
            "Items": items.get('Items')
        })
    }
