import json


def respond(items, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({
            'items': items,
            'status': status_code
        })
    }


def respond_http_method_error(http_method):
    return {
        'statusCode': 405,
        'body': json.dumps({
            'message': f'No resources are found for {http_method} at the moment!'
        })
    }


def respond_bad_request():
    return {
        'statusCode': 400,
        'body': json.dumps({
            'message': 'Item ID is required!'
        })
    }
