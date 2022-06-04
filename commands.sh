# Run localstack
localstack start -d

# Create Dynamo table
awsls dynamodb create-table --table-name sns-message-table --attribute-definitions AttributeName="id",AttributeType="S" --key-schema AttributeName="id",KeyType="HASH" --billing-mode PAY_PER_REQUEST

# Run with parameters and local env
# sam local invoke --env-vars local.json --parameter-overrides=ParameterKey=environment,ParameterValue=prod


# Create queue
awsls sqs create-queue --queue-name sam-test

# Create topic
awsls sns create-topic --name sam-topic-test

# Subscribe
awsls sns subscribe --topic-arn arn:aws:sns:eu-north-1:000000000000:sam-topic-test --protocol sqs --notification-endpoint http://localhost:4566/000000000000/sam-queue-test