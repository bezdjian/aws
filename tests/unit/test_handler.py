import json
from unittest.mock import patch, MagicMock

import pytest

from function import app


@pytest.fixture()
def sqs_event():
    """Generates SQS Event"""

    return {
        "Records": [
            {
                "messageId": "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
                "receiptHandle": "MessageReceiptHandle",
                "body": "Hello from SQS!",
                "attributes": {
                    "ApproximateReceiveCount": "1",
                    "SentTimestamp": "1765737845",
                    "SenderId": "123456789012",
                    "ApproximateFirstReceiveTimestamp": "1523232000001",
                },
                "messageAttributes": {},
                "md5OfBody": "7b270e59b47ff90a553787216d55d91d",
                "eventSource": "aws:sqs",
                "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:MyQueue",
                "awsRegion": "us-east-1",
            }
        ]
    }


def test_lambda_handler(sqs_event, monkeypatch):
    # Set environment variables
    monkeypatch.setenv("DB_TABLE", "test-table")
    monkeypatch.setenv("LOCAL_STACK_ENDPOINT", "")

    # Mock the DynamoDB client
    mock_dynamodb = MagicMock()
    mock_dynamodb.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}

    # Patch boto3.client to return our mock
    with patch("boto3.client", return_value=mock_dynamodb):
        app.lambda_handler(sqs_event, "")

        # Verify DynamoDB was called with correct parameters
        mock_dynamodb.put_item.assert_called_once()
        call_args = mock_dynamodb.put_item.call_args
        assert call_args.kwargs["TableName"] == "test-table"
        assert "Item" in call_args.kwargs
        assert "id" in call_args.kwargs["Item"]
        assert (
            call_args.kwargs["Item"]["messageId"]["S"]
            == "19dd0b57-b21e-4ac1-bd88-01bbb068cb78"
        )
        assert call_args.kwargs["Item"]["body"]["S"] == "Hello from SQS!"
