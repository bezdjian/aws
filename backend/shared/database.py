import os
from pathlib import Path

import boto3
from dotenv import load_dotenv

# Load environment variables from the backend directory (one level up from shared/)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# AWS Configuration
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME",
                                "eighty-twenty-calculations")
DYNAMODB_ENDPOINT_URL = os.getenv(
  "DYNAMODB_ENDPOINT_URL")  # For local development


def get_dynamodb_resource():
  """Get DynamoDB resource with configuration"""
  config = {}

  # Add endpoint URL for local development
  if DYNAMODB_ENDPOINT_URL:
    config["endpoint_url"] = DYNAMODB_ENDPOINT_URL

  return boto3.resource("dynamodb", **config)


def get_dynamodb_client():
  """Get DynamoDB client with configuration"""
  config = {}

  # Add endpoint URL for local development
  if DYNAMODB_ENDPOINT_URL:
    config["endpoint_url"] = DYNAMODB_ENDPOINT_URL

  return boto3.client("dynamodb", **config)


def get_table():
  """
  Get DynamoDB table reference.
  Note: Table must already exist (created via CloudFormation/SAM template)
  """
  dynamodb = get_dynamodb_resource()
  return dynamodb.Table(DYNAMODB_TABLE_NAME)
