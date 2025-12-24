import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

CLIENT_ID_PARAM_NAME = "/environment/services/eighty-twenty/google.client.id"
CLIENT_SECRET_PARAM_NAME = "/environment/services/eighty-twenty/google.client.secret"

ssm_client = boto3.client('ssm')


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
