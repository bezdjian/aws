import base64
import json
import os
import uuid
from datetime import datetime
from urllib.parse import quote

import boto3

# Initialize AWS services
s3 = boto3.client('s3')
bucket_name = os.environ['BOOKS_BUCKET']


def lambda_handler(event, context):
    """
    Lambda function to handle file operations
    """
    try:
        http_method = event['httpMethod']
        path_parameters = event.get('pathParameters') or {}
        resource_path = event.get('resource', '')

        if http_method == 'POST' and resource_path == '/files/upload':
            return upload_file(json.loads(event['body']))
        elif http_method == 'GET' and path_parameters.get('file_key'):
            return get_file_url(path_parameters['file_key'])
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


def upload_file(file_data):
    """Upload a file to S3"""
    try:
        # Extract file information
        file_content = file_data.get('file_content')  # Base64 encoded
        file_name = file_data.get('file_name')
        file_type = file_data.get('file_type', 'application/octet-stream')
        folder = file_data.get('folder', 'general')  # covers, documents, etc.

        if not file_content or not file_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'file_content and file_name are required'})
            }

        # Decode base64 file content
        try:
            file_bytes = base64.b64decode(file_content)
        except Exception:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid base64 file content'})
            }

        # Generate unique file key
        file_extension = file_name.split('.')[-1] if '.' in file_name else ''
        unique_id = str(uuid.uuid4())
        file_key = f"{folder}/{unique_id}.{file_extension}" if file_extension else f"{folder}/{unique_id}"

        # Upload to S3
        s3.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=file_bytes,
            ContentType=file_type,
            Metadata={
                'original_name': file_name,
                'upload_date': datetime.utcnow().isoformat(),
                'folder': folder
            }
        )

        # Generate public URL
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{quote(file_key)}"

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'File uploaded successfully',
                'file_key': file_key,
                'file_url': file_url,
                'original_name': file_name
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


def get_file_url(file_key):
    """Get a presigned URL for a file"""
    try:
        # Check if file exists
        try:
            s3.head_object(Bucket=bucket_name, Key=file_key)
        except s3.exceptions.NoSuchKey:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'File not found'})
            }

        # Generate presigned URL (valid for 1 hour)
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': file_key},
            ExpiresIn=3600  # 1 hour
        )

        # Also generate public URL
        public_url = f"https://{bucket_name}.s3.amazonaws.com/{quote(file_key)}"

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'file_key': file_key,
                'presigned_url': presigned_url,
                'public_url': public_url,
                'expires_in': 3600
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
