## When updating a service in docker-compose. Run:
$ docker-compose up -d --no-deps --build <service_name>

The --no-deps will not start linked services.


Springboot app, outside Docker, works with 'localhost' & 'host.docker.internal' when creating AmazonS3ClientBuilder. 
Springboot app within docker compose, works with 'localstack', hence the name of the service in docker-compose.

