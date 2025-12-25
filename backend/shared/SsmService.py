import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

CLIENT_ID_PARAM_NAME = "/environment/services/eighty-twenty/google.client.id"
CLIENT_SECRET_PARAM_NAME = "/environment/services/eighty-twenty/google.client.secret"

LOCALSTACK_URL = os.getenv("LOCALSTACK_URL")


def get_ssm_client():
  # Add endpoint URL for local development
  config = {}
  if LOCALSTACK_URL:
    config["endpoint_url"] = LOCALSTACK_URL
  return boto3.client('ssm', **config)


def get_google_client_id() -> str:
  logger.info("Getting client id for Google authentication")
  return _get_parameter(CLIENT_ID_PARAM_NAME)


def get_google_client_secret() -> str:
  logger.info("Getting client secret for Google authentication")
  return _get_parameter(CLIENT_SECRET_PARAM_NAME)


def _fallback(name):
  if "google.client.id" in name:
    return os.getenv("GOOGLE_CLIENT_ID")
  elif "google.client.secret" in name:
    return os.getenv("GOOGLE_CLIENT_SECRET")
  else:
    raise RuntimeError(f"SSM parameter {name} not found in .env fallback")


def _get_parameter(name: str) -> str:
  try:
    ssm_client = get_ssm_client()
    response = ssm_client.get_parameter(
        Name=name,
        WithDecryption=True
    )
    return response['Parameter']['Value']
  except ClientError as e:
    print(f"Fallback to .env. Failed to get SSM parameter {name}: {e}")
    return _fallback(name)
  except Exception as e:
    raise RuntimeError(f"Failed to get SSM parameter: {name}") from e
