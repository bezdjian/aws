# sam-app

### Experimenting Localstack with SAM CLI

- Running Lambda functions with SAM, which spins up a docker container and runs the function.
- Composing localstack through docker-compose.yaml.
- In order to the Lambda function within the docker container reach to localstack's container,
  we neet to create a network in docker-compose and assign localstack service to it, in this case the name of the network is 'sam_localstack_network',
  which in turn we can use it to run: ´sam local invoke --docker-network sam_localstack_network´ which will run
  the Lambda function's container on the same network so we can reach localstack's endpoint url.

   