import json
import os
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

import boto3

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
borrowed_table = dynamodb.Table(os.environ['BORROWED_BOOKS_TABLE'])
books_table = dynamodb.Table(os.environ['BOOKS_TABLE'])
users_table = dynamodb.Table(os.environ['USERS_TABLE'])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def lambda_handler(event, context):
    """
    Lambda function to handle borrowing operations
    """
    try:
        http_method = event['httpMethod']
        path_parameters = event.get('pathParameters') or {}
        resource_path = event.get('resource', '')

        if http_method == 'GET' and resource_path == '/borrowed':
            return get_borrowed_books(event)
        elif http_method == 'GET' and 'user_id' in path_parameters:
            return get_user_borrowed_books(path_parameters['user_id'])
        elif http_method == 'POST' and resource_path == '/borrow':
            return borrow_book(json.loads(event['body']))
        elif http_method == 'POST' and resource_path == '/return':
            return return_book(json.loads(event['body']))
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


def get_borrowed_books(event):
    """Get all borrowed books with optional filtering"""
    query_params = event.get('queryStringParameters') or {}

    try:
        if query_params.get('overdue') == 'true':
            # Get overdue books
            current_date = datetime.utcnow().isoformat()
            response = borrowed_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('due_date').lt(current_date) &
                                 boto3.dynamodb.conditions.Attr('returned_date').not_exists()
            )
        else:
            # Get all active borrowed books
            response = borrowed_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('returned_date').not_exists()
            )

        borrowed_books = response['Items']

        # Enrich with book and user details
        for borrowed_book in borrowed_books:
            try:
                # Get book details
                book_response = books_table.get_item(Key={'book_id': borrowed_book['book_id']})
                if 'Item' in book_response:
                    borrowed_book['book_details'] = book_response['Item']

                # Get user details
                user_response = users_table.get_item(Key={'user_id': borrowed_book['user_id']})
                if 'Item' in user_response:
                    borrowed_book['user_details'] = {
                        'first_name': user_response['Item']['first_name'],
                        'last_name': user_response['Item']['last_name'],
                        'email': user_response['Item']['email']
                    }
            except Exception:
                pass  # Continue if can't get details

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'borrowed_books': borrowed_books,
                'count': len(borrowed_books)
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


def get_user_borrowed_books(user_id):
    """Get borrowed books for a specific user"""
    try:
        response = borrowed_table.query(
            IndexName='user-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id),
            FilterExpression=boto3.dynamodb.conditions.Attr('returned_date').not_exists()
        )

        borrowed_books = response['Items']

        # Enrich with book details
        for borrowed_book in borrowed_books:
            try:
                book_response = books_table.get_item(Key={'book_id': borrowed_book['book_id']})
                if 'Item' in book_response:
                    borrowed_book['book_details'] = book_response['Item']
            except Exception:
                pass

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'borrowed_books': borrowed_books,
                'count': len(borrowed_books)
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


def borrow_book(borrow_data):
    """Borrow a book"""
    try:
        user_id = borrow_data.get('user_id')
        book_id = borrow_data.get('book_id')

        if not user_id or not book_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'user_id and book_id are required'})
            }

        # Check if user exists and is active
        user_response = users_table.get_item(Key={'user_id': user_id})
        if 'Item' not in user_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User not found'})
            }

        user = user_response['Item']
        if not user.get('is_active', True):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User account is inactive'})
            }

        # Check if book exists and is available
        book_response = books_table.get_item(Key={'book_id': book_id})
        if 'Item' not in book_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book not found'})
            }

        book = book_response['Item']
        if book.get('available_copies', 0) <= 0:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book is not available for borrowing'})
            }

        # Check if user already has this book borrowed
        existing_borrow = borrowed_table.query(
            IndexName='user-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id),
            FilterExpression=boto3.dynamodb.conditions.Attr('book_id').eq(book_id) &
                             boto3.dynamodb.conditions.Attr('returned_date').not_exists()
        )

        if existing_borrow['Items']:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User already has this book borrowed'})
            }

        # Create borrowing record
        borrow_id = str(uuid.uuid4())
        due_date = (datetime.utcnow() + timedelta(days=14)).isoformat()  # 2 weeks from now

        borrow_item = {
            'borrow_id': borrow_id,
            'user_id': user_id,
            'book_id': book_id,
            'borrowed_date': datetime.utcnow().isoformat(),
            'due_date': due_date,
            'created_at': datetime.utcnow().isoformat()
        }

        # Update book available copies
        books_table.update_item(
            Key={'book_id': book_id},
            UpdateExpression='SET available_copies = available_copies - :decrement, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':decrement': 1,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )

        # Update user borrowed books count
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET borrowed_books_count = borrowed_books_count + :increment, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':increment': 1,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )

        # Create borrowing record
        borrowed_table.put_item(Item=borrow_item)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Book borrowed successfully',
                'borrow_record': borrow_item
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


def return_book(return_data):
    """Return a borrowed book"""
    try:
        borrow_id = return_data.get('borrow_id')

        if not borrow_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'borrow_id is required'})
            }

        # Get borrowing record
        borrow_response = borrowed_table.get_item(Key={'borrow_id': borrow_id})
        if 'Item' not in borrow_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Borrow record not found'})
            }

        borrow_record = borrow_response['Item']

        # Check if book is already returned
        if 'returned_date' in borrow_record:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Book has already been returned'})
            }

        # Update borrowing record with return date
        returned_date = datetime.utcnow().isoformat()
        borrowed_table.update_item(
            Key={'borrow_id': borrow_id},
            UpdateExpression='SET returned_date = :returned_date',
            ExpressionAttributeValues={':returned_date': returned_date}
        )

        # Update book available copies
        books_table.update_item(
            Key={'book_id': borrow_record['book_id']},
            UpdateExpression='SET available_copies = available_copies + :increment, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':increment': 1,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )

        # Update user borrowed books count
        users_table.update_item(
            Key={'user_id': borrow_record['user_id']},
            UpdateExpression='SET borrowed_books_count = borrowed_books_count - :decrement, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':decrement': 1,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Book returned successfully',
                'returned_date': returned_date
            })
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
