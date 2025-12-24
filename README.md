# Eighty-Twenty Salary Calculator

A full-stack serverless application for calculating salary distribution based on the 80/20 principle, built with AWS SAM, DynamoDB, API Gateway, and Lambda.

## 🎯 Overview

The Eighty-Twenty calculator helps you manage your salary by automatically splitting it into:

- **80%** for essentials (bills, savings, necessities)
- **20%** for discretionary spending (entertainment, hobbies, etc.)

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│ API Gateway  │─────▶│   Lambda    │─────▶│  DynamoDB    │
│  (React)    │      │   (REST)     │      │  Functions  │      │   Table      │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
```

### Components

- **Frontend**: React application (coming soon)
- **API Gateway**: REST API for HTTP requests
- **Lambda Functions**: Serverless compute for CRUD operations
- **DynamoDB**: NoSQL database for data storage
- **CloudWatch**: Logging and monitoring

## 📁 Project Structure

```
eighty-twenty/
├── backend/                    # Backend application code
│   ├── shared/                # Core logic (CRUD, schemas, database)
│   ├── fastapi_app/           # FastAPI application (for local dev)
│   ├── lambda_app/            # AWS Lambda function handlers
│   ├── requirements.txt       # Python dependencies
│   ├── test_crud.py           # CRUD tests
│   └── README.md              # Backend documentation
├── frontend/                   # Frontend application (coming soon)
├── events/                     # Sample Lambda events for testing
│   ├── create.json
│   ├── get-all.json
│   ├── get-one.json
│   ├── update.json
│   └── delete.json
├── template.yaml              # AWS SAM template
├── samconfig.toml             # SAM CLI configuration
└── Makefile                   # Common commands (build, deploy, test)
```

## 🚀 Quick Start

### 1. Prerequisite Setup

- AWS Account and CLI configured
- AWS SAM CLI installed
- Python 3.11+
- [LocalStack](https://localstack.cloud/) (optional for local cloud emulation)

### 2. Local Development (FastAPI)

```bash
# Setup environment
pip install -r backend/requirements.txt

# Run FastAPI server
make dev
```

This will start the FastAPI server at http://localhost:8000. But before that you need to have LocalStack running and deployed to it with `make deploy-localstack`.

Visit: http://localhost:8000/docs

### 3. Deploy to AWS (Serverless)

```bash
# Build
make build

# Deploy (first time)
make deploy-guided

# Deploy (subsequent)
make deploy
```

## 📊 Database Management

Database operations are handled via the `Makefile` using the AWS CLI.

```bash
# View table info (defaults to localstack environment)
make db-info

# List items
make db-list

# Run against specific environment
make db-info ENVIRONMENT=dev
```

## 🧪 Testing

### Test Lambda Functions Locally

```bash
# Test create function
sam local invoke CreateCalculationFunction --event events/create.json
```

### Run Local API (SAM)

```bash
make start-api
```

API available at: http://localhost:3000

### Run CRUD Tests

```bash
make test
```

## 🌍 Environments

The application supports multiple environments managed via `samconfig.toml` and `Makefile`:

- **dev**: Development environment
- **prod**: Production environment
- **localstack**: Local cloud emulation

## 📖 Documentation

- **[backend/README.md](backend/README.md)** - Detailed backend documentation
- **[frontend/README.md](frontend/README.md)** - Detailed frontend documentation

## 💰 Cost Estimation (Low Traffic)

- **DynamoDB**: $0-1
- **Lambda**: $0-1
- **API Gateway**: $0-1
- **Total**: < $5/month (Often $0 within AWS Free Tier)
