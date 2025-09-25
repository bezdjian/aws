import json
import os
import re
import uuid
from datetime import datetime
from decimal import Decimal

import boto3

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['USERS_TABLE'])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def lambda_handler(event, context):
    """
    Lambda function to handle user operations
    """
    try:
        http_method = event['httpMethod']
        path_parameters = event.get('pathParameters') or {}

        if http_method == 'GET' and not path_parameters:
            return get_users(event)
        elif http_method == 'GET' and path_parameters.get('user_id'):
            return get_user(path_parameters['user_id'])
        elif http_method == 'POST':
            return create_user(json.loads(event['body']))
        elif http_method == 'PUT' and path_parameters.get('user_id'):
            return update_user(path_parameters['user_id'], json.loads(event['body']))
        elif http_method == 'DELETE' and path_parameters.get('user_id'):
            return delete_user(path_parameters['user_id'])
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid request'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def get_users(event):
    """Get all users with optional filtering"""
    query_params = event.get('queryStringParameters') or {}

    try:
        if query_params.get('search'):
            # Search by name or email
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('first_name').contains(query_params['search']) |
                                 boto3.dynamodb.conditions.Attr('last_name').contains(query_params['search']) |
                                 boto3.dynamodb.conditions.Attr('email').contains(query_params['search'])
            )
        else:
            response = table.scan()

        users = response['Items']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'users': users,
                'count': len(users)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def get_user(user_id):
    """Get a specific user by ID"""
    try:
        response = table.get_item(Key={'user_id': user_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'})
            }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response['Item'], cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def create_user(user_data):
    """Create a new user"""
    try:
        # Validate required fields
        if not user_data.get('email') or not validate_email(user_data['email']):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Valid email is required'})
            }

        if not user_data.get('first_name') or not user_data.get('last_name'):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'First name and last name are required'})
            }

        # Check if email already exists
        try:
            email_check = table.query(
                IndexName='email-index',
                KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(user_data['email'])
            )
            if email_check['Items']:
                return {
                    'statusCode': 409,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email already exists'})
                }
        except Exception:
            pass  # Index might not be ready yet

        user_id = str(uuid.uuid4())

        user_item = {
            'user_id': user_id,
            'email': user_data['email'].lower(),
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'phone': user_data.get('phone', ''),
            'address': user_data.get('address', ''),
            'membership_type': user_data.get('membership_type', 'standard'),
            'is_active': True,
            'borrowed_books_count': 0,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        table.put_item(Item=user_item)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'User created successfully',
                'user': user_item
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def update_user(user_id, user_data):
    """Update an existing user"""
    try:
        # Check if user exists
        existing_response = table.get_item(Key={'user_id': user_id})
        if 'Item' not in existing_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'})
            }

        # Validate email if provided
        if 'email' in user_data and not validate_email(user_data['email']):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Valid email is required'})
            }

        # Update user
        update_expression = "SET updated_at = :updated_at"
        expression_values = {':updated_at': datetime.utcnow().isoformat()}

        for key, value in user_data.items():
            if key not in ['user_id', 'created_at']:  # Don't allow updating these fields
                if key == 'email':
                    value = value.lower()
                update_expression += f", {key} = :{key}"
                expression_values[f':{key}'] = value

        response = table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues='ALL_NEW'
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'User updated successfully',
                'user': response['Attributes']
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def delete_user(user_id):
    """Delete a user (soft delete by setting is_active to False)"""
    try:
        # Check if user exists
        response = table.get_item(Key={'user_id': user_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'})
            }

        # Soft delete by setting is_active to False
        table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET is_active = :is_active, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':is_active': False,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'User deactivated successfully'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
