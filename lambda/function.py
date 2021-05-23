import os
from helper import respond, respond_bad_request, respond_http_method_error
import uuid

import boto3
from boto3.dynamodb.conditions import Key


def handler(event, context):
    print("event: ", event)

    http_method = event['httpMethod']

    proxy_param = event['pathParameters']['proxy'] \
        if event['pathParameters'] else ''

    print("proxy_param: ", proxy_param)
    print("http method: ", http_method)
    table = get_table()

    if http_method == 'GET':
        if proxy_param == '':
            print('Getting all items')
            return scan_items(table)
        else:
            print('Getting one item')
            return get_item(proxy_param, table)
    elif http_method == 'POST':
        print('Posting one item')
        return post_item(table)
    elif http_method == 'DELETE':
        if not proxy_param:
            return respond_bad_request()
        print('Deleting one item')
        return delete_item(proxy_param, table)

    return respond_http_method_error(http_method)


def post_item(table):
    item_id = str(uuid.uuid4().hex)
    # Item to create
    item = {
        'id': item_id,
        'item_name': f'name-{item_id}'
    }

    table.put_item(
        Item=item
    )

    return respond(item, 200)


def scan_items(table):
    items = table.scan()
    return respond(items.get('Items'), 200)


def get_item(item_id, table):
    items = table.query(
        ProjectionExpression="id, item_name",
        # ExpressionAttributeNames={'#name', 'name'},
        KeyConditionExpression=
        Key('id').eq(item_id)
    )
    return respond(items.get('Items'), 200)


def delete_item(item_id, table):
    item = table.delete_item(
        Key={
            'id': item_id
        }
    )
    return respond(item, 200)


def get_table():
    table_name = os.getenv('DB_TABLE')
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)
    return table
