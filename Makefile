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
build:
	@echo "Building SAM application..."
	sam build

# Deploy with saved configuration
deploy: build
	@echo "Deploying to AWS..."
	sam deploy

# Deploy with guided prompts (first time)
deploy-guided: build
	@echo "Starting guided deployment..."
	sam deploy --guided

# Deploy to specific environments
deploy-aws-dev: build
	@echo "Deploying to dev environment..."
	sam build
	sam deploy --config-env dev

deploy-aws-prod: build
	@echo "Deploying to production environment..."
	sam build
	sam deploy --config-env prod --parameter-overrides Environment=prod

# Test Lambda functions locally
test-local: build
	@echo "Testing CreateCalculationFunction..."
	sam local invoke CreateCalculationFunction --event backend/lambda_app/events/create.json
	@echo ""
	@echo "Testing GetCalculationsFunction..."
	sam local invoke GetCalculationsFunction --event backend/lambda_app/events/get-all.json

# Start local API server
start-api: build
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
delete:
	@echo "Deleting CloudFormation stack..."
	sam delete --stack-name eighty-twenty

# Show stack outputs
outputs:
	@echo "Fetching stack outputs..."
	sam list stack-outputs --stack-name eighty-twenty

# Package for deployment
package: build
	@echo "Packaging application..."
	sam package --output-template-file packaged.yaml

# Sync for rapid development
sync: build
	@echo "Syncing changes to AWS..."
	sam sync --stack-name eighty-twenty

# View all resources in stack
resources:
	@echo "Listing stack resources..."
	sam list resources --stack-name eighty-twenty

# View all endpoints
endpoints:
	@echo "Listing API endpoints..."
	sam list endpoints --stack-name eighty-twenty

LOCALSTACK_URL ?= http://localhost:4566

### Localstack ###
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
get-api-url:
	@aws cloudformation describe-stacks \
		--stack-name eighty-twenty-${ENVIRONMENT} \
		--query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
		--output text


build-frontend:
	@export VITE_BACKEND_API_URL=$(aws cloudformation describe-stacks --stack-name eighty-twenty-${ENVIRONMENT} --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text) && \
	cd frontend && npm install && npm run build