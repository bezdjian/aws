# Sam template #

AWS Lambda function creates an S3 bucket and DynamoDB table, triggers Lambda
 function that reads the S3 object's key and time and saves into DynamoDB table.

### Run the app locally with localstack
- Run docker-compose up --build
- After docker compose is up, access Localstack health http://localhost:4566/health
- Create bucket and DynamoDB table in localstack.
    - `awslocal dynamodb create-table --table-name bucket-events-table --attribute-definitions AttributeName="id",AttributeType="S" --key-schema AttributeName="id",KeyType="HASH" --billing-mode PAY_PER_REQUEST`
- Run the application
    - 
    ```bash
    $ sam local invoke --docker-network sam_localstack_network --event event/s3-event.json --env-vars env.json
    ```