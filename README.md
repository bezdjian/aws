# java-s3-bucket-event-lambda

### Start localstack
`localstack start`

### Build and deploy stack
`samlocal build && samlocal deploy`


### Put csv file in s3 bucket to trigger the lambda function
`awslocal s3api put-object --bucket whitelisting-for-sas-token-cache --key testing.csv --body events/test.csv`

After this step, you can click on the container in Docker desktop to see the lambda logs.

### Scan and check the items in the dynamo table
`awslocal dynamodb scan --table-name sas-token-cache-outbound`
