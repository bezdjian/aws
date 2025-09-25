import json
import os
import uuid
from datetime import datetime
from decimal import Decimal

import boto3

APPLICATION_JSON = 'application/json'

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
table = dynamodb.Table(os.environ['BOOKS_TABLE'])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def lambda_handler(event, context):
    """
    Lambda function to handle book operations
    """
    try:
        http_method = event['httpMethod']
        path_parameters = event.get('pathParameters') or {}

        if http_method == 'GET' and not path_parameters:
            return get_books(event)
        elif http_method == 'GET' and path_parameters.get('book_id'):
            return get_book(path_parameters['book_id'])
        elif http_method == 'POST':
            return create_book(json.loads(event['body']))
        elif http_method == 'PUT' and path_parameters.get('book_id'):
            return update_book(path_parameters['book_id'], json.loads(event['body']))
        elif http_method == 'DELETE' and path_parameters.get('book_id'):
            return delete_book(path_parameters['book_id'])
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': APPLICATION_JSON,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid request'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def get_books(event):
    """Get all books with optional filtering"""
    query_params = event.get('queryStringParameters') or {}

    try:
        if query_params.get('search'):
            # Search by title
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('title').contains(query_params['search'])
            )
        else:
            response = table.scan()

        books = response['Items']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'books': books,
                'count': len(books)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def get_book(book_id):
    """Get a specific book by ID"""
    try:
        response = table.get_item(Key={'book_id': book_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': APPLICATION_JSON,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book not found'})
            }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response['Item'], cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def create_book(book_data):
    """Create a new book"""
    try:
        book_id = str(uuid.uuid4())

        book_item = {
            'book_id': book_id,
            'title': book_data['title'],
            'author': book_data['author'],
            'isbn': book_data.get('isbn', ''),
            'genre': book_data.get('genre', ''),
            'publication_year': book_data.get('publication_year', 0),
            'description': book_data.get('description', ''),
            'available_copies': book_data.get('available_copies', 1),
            'total_copies': book_data.get('total_copies', 1),
            'cover_image_url': book_data.get('cover_image_url', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        table.put_item(Item=book_item)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Book created successfully',
                'book': book_item
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def update_book(book_id, book_data):
    """Update an existing book"""
    try:
        # Check if book exists
        existing_response = table.get_item(Key={'book_id': book_id})
        if 'Item' not in existing_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': APPLICATION_JSON,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book not found'})
            }

        # Update book
        update_expression = "SET updated_at = :updated_at"
        expression_values = {':updated_at': datetime.utcnow().isoformat()}

        for key, value in book_data.items():
            if key != 'book_id':  # Don't allow updating the ID
                update_expression += f", {key} = :{key}"
                expression_values[f':{key}'] = value

        response = table.update_item(
            Key={'book_id': book_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues='ALL_NEW'
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Book updated successfully',
                'book': response['Attributes']
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def delete_book(book_id):
    """Delete a book"""
    try:
        # Check if book exists
        response = table.get_item(Key={'book_id': book_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': APPLICATION_JSON,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book not found'})
            }

        # Delete the book
        table.delete_item(Key={'book_id': book_id})

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Book deleted successfully'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': APPLICATION_JSON,
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
