# sam-app

This project contains source code and supporting files for a serverless application that you can deploy with the SAM
CLI. It includes the following files and folders.

- Start the localStack

`localstack start`

Deploy the template with samlocal towards localstack

`samlocal deploy`


Run the lambda function with logs output

`awslocal lambda invoke --function-name sam-app-HelloWorldFunction-03fea2fd out.json --payload file://events/event.json \
--cli-binary-format raw-in-base64-out --log-type Tail --query 'LogResult' --output text | base64 -d`
