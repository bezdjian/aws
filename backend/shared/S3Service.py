import csv
import os
import tempfile
from typing import List

import boto3
from botocore.exceptions import ClientError

from .schemas import SalaryCalculationBase

S3_REPORTS_BUCKET = os.getenv("S3_REPORTS_BUCKET")
LOCALSTACK_URL = os.getenv("LOCALSTACK_URL")


def get_s3_client():
  # Add endpoint URL for local development
  config = {}
  if LOCALSTACK_URL:
    config["endpoint_url"] = LOCALSTACK_URL

  return boto3.client('s3', **config)


def upload_report_to_s3(calculation: SalaryCalculationBase) -> None:
  """Upload a report file to S3 and return the file URL.

  :param calculation: dict representing the salary calculation
  :return: URL of the uploaded file
  """
  object_name = f"{calculation.email}_{calculation.client_name}_{calculation.date.strftime('%Y%m%d')}.csv"
  local_file_path = create_csv_from_calculation(calculation)
  bucket_key = f"{calculation.date.year}/{calculation.date.month}/{object_name}"

  try:
    s3_client = get_s3_client()
    s3_client.upload_file(Filename=local_file_path,
                          Bucket=S3_REPORTS_BUCKET,
                          Key=bucket_key)

    print(f"File uploaded to S3 at {bucket_key}")

    # Clean up the local temporary file
    try:
      os.remove(local_file_path)
      print(f"Cleaned up local file: {local_file_path}")
    except Exception as cleanup_error:
      print(f"Failed to clean up local file {local_file_path}: {cleanup_error}")

  except ClientError as e:
    print(f"Failed to upload file to S3: {e}")
    # Clean up local file even on error
    try:
      os.remove(local_file_path)
    except Exception:
      pass
    raise
  except Exception as e:
    print(f"Unexpected error during S3 upload: {e}")


def create_csv_from_calculation(calculation: SalaryCalculationBase) -> str:
  """Create a CSV file from a single SalaryCalculationBase object in a temporary location.

  :param calculation: SalaryCalculationBase object
  :return: Path of the created temporary CSV file
  """
  try:
    field_names = list(calculation.model_dump().keys())

    # Create a temporary file with .csv suffix
    temp_fd, temp_path = tempfile.mkstemp(suffix='.csv', prefix='salary_calc_')

    # Close the file descriptor and write using the path
    os.close(temp_fd)

    with open(temp_path, 'w', newline='', encoding='utf-8') as file:
      writer = csv.DictWriter(file, fieldnames=field_names)
      writer.writeheader()
      writer.writerow(calculation.model_dump())

    print(f"CSV file created at: {temp_path}")
    return temp_path
  except Exception as e:
    print(f"Failed to create CSV file: {e}")
    raise


def create_csv_from_calculations(calculations: List[SalaryCalculationBase],
    file_path: str) -> str:
  """Create a CSV file from SalaryCalculationBase objects with field names as headers.

  :param calculations: List of SalaryCalculationBase objects
  :param file_path: Path to save the CSV file
  :return: Path of the created CSV file
  """
  if not calculations:
    raise ValueError("No calculations provided")

  try:
    # Get field names from the first calculation object
    field_names = list(calculations[0].model_dump().keys())

    with open(file_path, 'w', newline='', encoding='utf-8') as file:
      writer = csv.DictWriter(file, fieldnames=field_names)
      writer.writeheader()

      for calculation in calculations:
        writer.writerow(calculation.model_dump())

    print(f"CSV file created at: {file_path}")
    return file_path
  except Exception as e:
    print(f"Failed to create CSV file: {e}")
    raise


def generate_presigned_url(bucket_key: str,
    expiration: int = 3600) -> str | None:
  """Generate a pre-signed URL for an existing S3 object.

  Useful for regenerating URLs when they expire or for sharing existing reports.

  :param bucket_key: S3 object key (e.g., "2025/12/user@example.com_ClientName_20251225.csv")
  :param expiration: URL expiration time in seconds (default: 1 hour)
  :return: Pre-signed URL or None if error occurs or object doesn't exist
  """
  try:
    s3_client = get_s3_client()

    check_bucket_key_exists(s3_client, bucket_key)

    file_url = s3_client.generate_presigned_url(
        'get_object',
        Params={
          'Bucket': S3_REPORTS_BUCKET,
          'Key': bucket_key
        },
        ExpiresIn=expiration
    )

    return file_url
  except ClientError as e:
    print(f"Failed to generate pre-signed URL: {e}")
    return None


def check_bucket_key_exists(s3_client, bucket_key: str) -> None:
  try:
    s3_client.head_object(Bucket=S3_REPORTS_BUCKET, Key=bucket_key)
  except ClientError as e:
    if e.response['Error']['Code'] == '404':
      print(f"Object not found in S3: {bucket_key}")
      raise e
    else:
      # Re-raise other errors (permission issues, etc.)
      raise
