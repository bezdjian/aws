import os


def handler(event, context):
    print("event: ", event)

    table_name = os.getenv('DB_TABLE')
    print("Table: ", table_name)

    return {
        'StatusCode': 200,
        'body': "Hello Pycharm CDK!"
    }
