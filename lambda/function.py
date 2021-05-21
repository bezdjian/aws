def handler(event, context):
    print("event: ", event)

    return {
        'StatusCode': 200,
        'body': "Hello Pycharm CDK!"
    }
