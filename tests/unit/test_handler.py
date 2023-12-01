import json
import unittest
from unittest.mock import Mock, patch

from hello_world import app


class AppTest(unittest.TestCase):
    expected_status_type = "TEST_STATUS_TYPE_UNKNOWN"
    external_id = "3A9AC5E49ACF4D1E84F37646E874C542"

    # Generates API GW Event
    apigw_event = {
        "body": "{ \"externalId\": \"" + external_id + "\"}",
        "headers": {
            "Tenant": "/vw/vw/local/test",
        },
        "httpMethod": "POST",
        "path": "/hello",
    }

    # Generate dynamo db get_item response
    item_response = {
        'Item': {
            'statusType': expected_status_type,
            'externalId': external_id,
            'countryCode': 'DE',
            'latestMessageSentTimestamp': '1665109040272',
            'partNumber': 'randomPartNumberUpdated', 'receivedTimestamp': '0', 'brand': 'V'
        },
        'ResponseMetadata': {
            'RequestId': '123',
            'HTTPStatusCode': 200,
            'HTTPHeaders': {
                'server': 'Server', 'date': 'Fri, 01 Dec 2023 10:26:48 GMT',
                'content-type': 'application/x-amz-json-1.0', 'content-length': '274',
                'connection': 'keep-alive',
                'x-amzn-requestid': '321',
                'x-amz-crc32': '1948137519'}, 'RetryAttempts': 0
        }
    }

    @patch("boto3.resource")
    def test_lambda_handler(self, mock_dynamo):
        mock_table = Mock()
        mock_table.get_item.return_value = self.item_response

        # This is important!
        mock_dynamo.return_value = mock_dynamo
        mock_dynamo.Table.return_value = mock_table

        response = app.lambda_handler(self.apigw_event, "")
        data = json.loads(response["body"])

        assert response["statusCode"] == 200
        assert "message" in response["body"]

        expected_body = {
            "statusType": self.expected_status_type,
            "externalId": self.external_id
        }
        assert data["message"] == expected_body
