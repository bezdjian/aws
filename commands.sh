# Install & run localstack
# pip install localstack
localstack start -d

# create bucket 'buckets4lambda' for sam to upload the project.
awslocal s3 mb s3://buckets4lambda

# pip install aws-sam-cli-local
samlocal deploy

# Run with parameters and local env
# sam local invoke --env-vars local.json --parameter-overrides=ParameterKey=environment,ParameterValue=prod
samlocal local invoke --event events/sns_event.json --env-vars local.json

# Scan table
awslocal dynamodb scan --table-name sns-message-table

#Scan table - get count only
awslocal dynamodb scan --table-name sns-message-table --query Count
