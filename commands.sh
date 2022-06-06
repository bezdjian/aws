# Install & run localstack
pip install localstack
localstack start -d

# OBS: awsls is an alias to 'aws --endpoint-url=http://localhost:4566', awslocal cli was not working as intended.

# Create Dynamo table
awsls dynamodb create-table --table-name sns-message-table --attribute-definitions AttributeName="id",AttributeType="S" --key-schema AttributeName="id",KeyType="HASH" --billing-mode PAY_PER_REQUEST

# Run with parameters and local env
# sam local invoke --env-vars local.json --parameter-overrides=ParameterKey=environment,ParameterValue=prod
sam local invoke --event events/sns_event.json --env-vars local.json

# Create topic, copy the ARN
awsls sns create-topic --name sam-topic-test

# Lambda subscription
awsls sns subscribe --topic-arn arn:aws:sns:eu-north-1:000000000000:sam-topic-test --protocol lambda --notification-endpoint http://localhost:4566/000000000000/sam-queue-test