# Eighty-Twenty Backend

Modular backend for the Eighty-Twenty salary calculator, supporting both local development (FastAPI)
and production deployment (AWS Lambda).

## 🏗️ Structure

```
backend/
├── shared/           # Core logic (CRUD, schemas, database connection)
├── fastapi_app/      # FastAPI implementation (for local development)
├── lambda_app/       # AWS Lambda handlers (for production)
├── requirements.txt  # Project dependencies
└── .env.example      # Environment variables template
```

## 🚀 Getting Started

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
```

### 2. Configure Local Settings

Edit `backend/.env` with your settings. If using **LocalStack**:

```env
ENVIRONMENT=localstack
LOCALSTACK_URL=http://localhost:4566
DYNAMODB_TABLE_NAME=eighty-twenty-calculations-localstack
```

### 3. Run FastAPI (Local Dev)

```bash
make dev
```

Visit: http://localhost:8000/docs

## 📊 Database Management

Database operations are handled via the `Makefile` using the AWS CLI. By default, these commands use
`ENVIRONMENT=localstack`.

### View Table Info

```bash
make db-info
# Override environment:
make db-info ENVIRONMENT=dev
```

### List Items

```bash
make db-list
# Override environment:
make db-list ENVIRONMENT=staging
```

> **Note:** The DynamoDB table is managed via CloudFormation/SAM (`template.yaml`). Use `sam deploy`
> to create it and `sam delete` to remove it.

## 🧪 Testing

### Run CRUD Tests

```bash
make test
```

### Local SAM Invocation

```bash
sam local invoke CreateCalculationFunction --event backend/lambda_app/events/create.json
```

## 🛠️ Technology Stack

- **FastAPI**: Local development server
- **AWS Lambda**: Production serverless functions
- **AWS DynamoDB**: NoSQL database
- **Boto3**: AWS SDK for Python
- **Pydantic**: Data validation and schemas
- **AWS SAM**: Infrastructure as Code and deployment

## 🔐 Security

- **Environment Isolation**: Separate tables for dev, staging, and prod.
- **Least Privilege**: IAM roles defined in `template.yaml`.
- **Encryption**: DynamoDB encryption at rest enabled.
