import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

OPENAI_API_KEY_NAME = "/eighty-twenty/openai-api-key"
GOOGLE_CLIENT_SECRET_NAME = "/eighty-twenty/google-client-secret"

LOCALSTACK_URL = os.getenv("LOCALSTACK_URL")
_CACHE = {}


def get_secret_manager_client():
  # Add endpoint URL for local development
  config = {}
  if LOCALSTACK_URL:
    config["endpoint_url"] = LOCALSTACK_URL
  return boto3.client("secretsmanager", **config)


def get_openai_api_key() -> str:
  logger.info("Getting OpenAI API key")
  return _get_parameter(OPENAI_API_KEY_NAME)

def get_google_client_secret() -> str:
  logger.info("Getting Google client secret")
  return _get_parameter(GOOGLE_CLIENT_SECRET_NAME)


def _fallback(name):
  # Fallback to .env variables for local development
  if "openai-api-key" in name:
    env_value = os.getenv("OPENAI_API_KEY")
  elif "google-client-secret" in name:
    env_value = os.getenv("GOOGLE_CLIENT_SECRET")
  else:
    raise RuntimeError(f"Secret {name} not found in .env fallback")
  return env_value if env_value else None


def _get_parameter(name: str) -> str:
  if name in _CACHE:
    return _CACHE[name]

  try:
    secret_client = get_secret_manager_client()
    response = secret_client.get_secret_value(SecretId=name)
    val = response["SecretString"]
    _CACHE[name] = val
    return val
  except ClientError as e:
    print(f"Fallback to .env. Failed to get Secret {name}: {e}")
    return _fallback(name)
  except Exception as e:
    raise RuntimeError(f"Failed to get Secret: {name}") from e
