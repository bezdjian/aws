.PHONY: help validate build deploy deploy-guided test-local start-api logs clean delete install test dev frontend db-info db-list outputs package sync resources endpoints deploy-localstack resources-localstack delete-localstack outputs-localstack

# Default target
help:
	@echo "Eighty-Twenty SAM Application - Available Commands:"
	@echo ""
	@echo "  make install        - Install Python dependencies"
	@echo "  make validate       - Validate SAM template"
	@echo "  make build          - Build SAM application"
	@echo "  make deploy         - Deploy to AWS (uses saved config)"
	@echo "  make deploy-guided  - Deploy with guided prompts"
	@echo "  make deploy-dev     - Deploy to dev environment"
	@echo "  make deploy-staging - Deploy to staging environment"
	@echo "  make deploy-prod    - Deploy to production environment"
	@echo "  make test-local     - Test Lambda functions locally"
	@echo "  make start-api      - Start local API server"
	@echo "  make logs           - Tail CloudWatch logs"
	@echo "  make test           - Run CRUD tests"
	@echo "  make dev            - Run FastAPI backend development server"
	@echo "  make frontend       - Run React frontend development server"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make delete         - Delete CloudFormation stack"
	@echo ""

# Install dependencies
install:
	@echo "Installing Python dependencies..."
	cd backend && pip install -r requirements.txt

# Validate SAM template
validate:
	@echo "Validating SAM template..."
	sam validate

# Build SAM application
## Dev
sam-build:
	@echo "Building SAM for dev environment..."
	sam build

# Deploy with saved configuration
sam-deploy-dev: sam-build
	@echo "Deploying to AWS..."
	sam deploy --config-env dev

## Prod
sam-build-prod:
	@echo "Building SAM for production environment..."
	sam build --config-env prod

sam-deploy-prod: sam-build-prod
	@echo "Deploying to production environment..."
	sam deploy --config-env prod

# Test Lambda functions locally
test-local: sam-build
	@echo "Testing CreateCalculationFunction..."
	sam local invoke CreateCalculationFunction --event backend/lambda_app/events/create.json
	@echo ""
	@echo "Testing GetCalculationsFunction..."
	sam local invoke GetCalculationsFunction --event backend/lambda_app/events/get-all.json

# Start local API server
start-api: sam-build
	@echo "Starting local API server on http://localhost:3000"
	sam local start-api

# Tail CloudWatch logs
logs:
	@echo "Tailing logs for CreateCalculationFunction..."
	sam logs -n CreateCalculationFunction --stack-name eighty-twenty --tail

# Run CRUD tests
test:
	@echo "Running CRUD tests..."
	cd backend && python test_crud.py

# Run local FastAPI server (for development)
dev:
	@echo "Starting FastAPI development server..."
	cd backend && uvicorn fastapi_app.main:app --reload --reload-dir fastapi_app --reload-dir shared

# Run local React server (for development)
frontend:
	@echo "Starting React development server..."
	cd frontend && npm run start

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .aws-sam
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Delete CloudFormation stack
sam-delete-dev:
	@echo "Deleting CloudFormation stack..."
	sam delete --config-env dev

# Show stack outputs
outputs-dev:
	@echo "Fetching stack outputs..."
	sam list stack-outputs --config-env dev --stack-name eighty-twenty-dev


### Localstack ###
LOCALSTACK_URL ?= http://localhost:4566
deploy-localstack:
	@echo "Deploying to localstack environment..."
	samlocal build
	samlocal deploy --config-env localstack


# Update Parameter value for Google Client ID
# Usage: make update-google-client-id GOOGLE_CLIENT_ID=<google-client-id>
update-ssm-parameters:
	@echo "Updating Parameter value for Google Client ID..."
	aws ssm put-parameter --name "/eighty-twenty/google-client-id" --value "$(GOOGLE_CLIENT_ID)" --type SecureString --overwrite --endpoint-url $(LOCALSTACK_URL)

# Update SecretsManager value for OpenAI API Key
# Usage: make update-openai-api-key OPENAI_API_KEY=<openai-api-key>
update-openai-api-key:
	@echo "Updating SecretsManager value for OpenAI API Key..."
	aws secretsmanager put-secret-value --secret-id "/eighty-twenty/openai-api-key" --secret-string "$(OPENAI_API_KEY)" --endpoint-url $(LOCALSTACK_URL)

# View all resources in stack
resources-localstack:
	@echo "Listing stack resources..."
	samlocal list resources --stack-name eighty-twenty-localstack
	
# Delete CloudFormation stack
delete-localstack:
	@echo "Deleting CloudFormation stack..."
	samlocal delete --stack-name eighty-twenty-localstack

# Show stack outputs
outputs-localstack:
	@echo "Fetching stack outputs..."
	samlocal list stack-outputs --stack-name eighty-twenty-localstack



# CI/CD stuff, check later if needed
ENVIRONMENT := ""

# Fetch the API URL from the deployed stack
# Usage: make get-api-url ENVIRONMENT=dev
get-api-url:
	@aws cloudformation describe-stacks \
		--stack-name eighty-twenty-${ENVIRONMENT} \
		--query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
		--output text

# Build the frontend with the API URL injected
# Usage: make build-frontend ENVIRONMENT=dev
build-frontend:
	@echo "Fetching API URL for environment: ${ENVIRONMENT}..."
	@API_URL=$$(aws cloudformation describe-stacks --stack-name eighty-twenty-${ENVIRONMENT} --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text) && \
	echo "Building frontend with VITE_BACKEND_API_URL=$$API_URL" && \
	cd frontend && npm install && VITE_BACKEND_API_URL=$$API_URL npm run build

# Build and deploy frontend to S3 and invalidate CloudFront
# Usage: make deploy-frontend ENVIRONMENT=dev
deploy-frontend: build-frontend
	@echo "Deploying frontend to S3 bucket..."
	@FRONTEND_BUCKET=$$(aws cloudformation describe-stacks --stack-name eighty-twenty-${ENVIRONMENT} --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' --output text) && \
	aws s3 sync frontend/dist/ s3://$$FRONTEND_BUCKET/ --delete && \
	echo "Frontend deployed to s3://$$FRONTEND_BUCKET"
	@echo "Invalidating CloudFront cache..."
	@CF_DIST_ID=$$(aws cloudformation describe-stack-resources --stack-name eighty-twenty-${ENVIRONMENT} --query 'StackResources[?LogicalResourceId==`FrontendCloudFrontDistribution`].PhysicalResourceId' --output text) && \
	aws cloudfront create-invalidation --distribution-id $$CF_DIST_ID --paths "/*" > /dev/null && \
	echo "CloudFront invalidation triggered for $$CF_DIST_ID"
