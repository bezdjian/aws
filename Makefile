.PHONY: help validate build deploy deploy-guided test-local start-api logs clean delete install test

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
deploy-dev: build
	@echo "Deploying to dev environment..."
	sam deploy --config-env default --parameter-overrides Environment=dev

deploy-prod: build
	@echo "Deploying to production environment..."
	sam deploy --config-env prod --parameter-overrides Environment=prod

# Test Lambda functions locally
test-local: build
	@echo "Testing CreateCalculationFunction..."
	sam local invoke CreateCalculationFunction --event events/create.json
	@echo ""
	@echo "Testing GetCalculationsFunction..."
	sam local invoke GetCalculationsFunction --event events/get-all.json

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

# Default table name (can be overridden on command line)
ENVIRONMENT := ""
LOCALSTACK_URL ?= http://localhost:4566

# View DynamoDB table info, localstack or dev
db-info:
	@echo "Fetching DynamoDB table info for $(ENVIRONMENT)..."
	@if [ "$(ENVIRONMENT)" = "localstack" ]; then \
		aws dynamodb describe-table --table-name eighty-twenty-calculations-$(ENVIRONMENT) --endpoint-url $(LOCALSTACK_URL) --query 'Table.{Name:TableName,Status:TableStatus,Items:ItemCount,Size:TableSizeBytes}' --output table; \
	else \
		aws dynamodb describe-table --table-name eighty-twenty-calculations-dev --query 'Table.{Name:TableName,Status:TableStatus,Items:ItemCount,Size:TableSizeBytes}' --output table; \
	fi

# List items in DynamoDB table, localstack or dev
db-list:
	@echo "Listing items in DynamoDB table $(ENVIRONMENT)..."
	@if [ "$(ENVIRONMENT)" = "localstack" ]; then \
		aws dynamodb scan --table-name eighty-twenty-calculations-$(ENVIRONMENT) --endpoint-url $(LOCALSTACK_URL) --max-items 10; \
	else \
		aws dynamodb scan --table-name eighty-twenty-calculations-dev --max-items 10; \
	fi

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


### Localstack ###
deploy-localstack: build
	@echo "Deploying to localstack environment..."
	samlocal deploy --config-env localstack --parameter-overrides Environment=localstack

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