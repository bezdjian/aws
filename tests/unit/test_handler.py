import json
import os
import pytest

from receive_message import app
from moto import mock_dynamodb


@pytest.fixture()
def sns_event():
    """ Generates SNS Event"""

    return {
        "Records": [
            {
                "EventSource": "aws:sns",
                "EventVersion": "1.0",
                "EventSubscriptionArn": "arn:aws:sns:us-east-1::ExampleTopic",
                "Sns": {
                    "Type": "Notification",
                    "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
                    "TopicArn": "arn:aws:sns:eu-north-1:000000000000:sam-topic-test",
                    "Subject": "example subject",
                    "Message": "Test message from event/sns_event.json",
                    "Timestamp": "2022-03-01T10:23:44.000Z",
                    "SignatureVersion": "1",
                    "Signature": "EXAMPLE",
                    "SigningCertUrl": "EXAMPLE",
                    "UnsubscribeUrl": "EXAMPLE",
                    "MessageAttributes": {
                        "Test": {
                            "Type": "String",
                            "Value": "TestString"
                        },
                        "TestBinary": {
                            "Type": "Binary",
                            "Value": "TestBinary"
                        }
                    }
                }
            }
        ]
    }


@mock_dynamodb
def test_lambda_handler(sns_event):
    os.environ.setdefault("DB_TABLE", "table")
    # os.environ.setdefault("LOCAL_STACK_ENDPOINT", "end")

    lambda_result = app.lambda_handler(sns_event, "")
    data = json.loads(lambda_result["body"])

    assert lambda_result["statusCode"] == 200
    assert "message" in lambda_result["body"]
    assert data["message"] == "hello world"
