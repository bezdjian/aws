# Spring boot with localstack (Local AWS environment)
The Spring boot app, outside Docker, works with 'localhost' & 'host.docker.internal' as endpoint url when creating AmazonS3ClientBuilder. 

Spring boot app within docker compose, works with 'localstack', hence the name of the service in docker-compose.

### Running the application separately
- Install and run localstack from cli: 
    `localstack start`
- From IntelliJ: Configure the application and add Environment Variables "LOCALSTACK=host.docker.internal" OR "LOCALSTACK=localhost"

### Running with Docker compose
- On the folder root, run:
`docker compose up --build`

- When updating a service in docker-compose, run:
`docker-compose up -d --no-deps --build <service_name>`

The --no-deps will not start linked services.

### Create buckets in localstack
`aws --endpoint-url=http://localhost:4566 s3 mb s3://bucket1`

### Create DynamoDB table
`aws --endpoint-url=http://localhost:4566 dynamodb create-table --table-name Albums --attribute-definitions AttributeName="Artist",AttributeType="S" --key-schema AttributeName="Artist",KeyType="HASH" --billing-mode PAY_PER_REQUEST`

### Put item in DynamoDB table
`aws --endpoint-url=http://localhost:4566 dynamodb put-item --table-name Albums --item file://items.json`

### Scan DynamoDB
`aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name Albums --query Items`

### Call get buckets api
http://localhost:8081/api/buckets

### Call get items api
http://localhost:8081/api/items

### Check LocalStack's health 
http://localhost:4566/health