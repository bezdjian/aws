import os
import sys
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Add parent directory to path to import shared module
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from shared import service, schemas  # noqa: E402

# Load environment variables from the backend directory
load_dotenv(backend_dir / ".env")

# Create FastAPI app
app = FastAPI(
    title="Eighty-Twenty Salary Calculator API",
    description="API for calculating salary distribution based on the 80/20 principle",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
  "http://localhost:5173",
  "https://localhost:5173",
  "http://127.0.0.1:5173",
  "https://127.0.0.1:5173",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
  """Root endpoint"""
  return {
    "message": "Welcome to Eighty-Twenty Salary Calculator API",
    "version": "1.0.0",
    "docs": "/docs"
  }


@app.get("/health", tags=["Health"])
async def health_check():
  """Health check endpoint"""
  return {"status": "healthy"}


@app.post("/auth/verify", tags=["Auth"])
async def verify_auth(token_data: schemas.TokenVerify):
  """Authentication verification endpoint"""
  return service.verify_token(token=token_data.token)


@app.get("/auth/client_id", tags=["Auth"])
async def get_client_id():
  """Authentication verification endpoint"""
  return service.get_client_id()


# CREATE - Create a new salary calculation
@app.post(
    "/calculations",
    response_model=schemas.SalaryCalculationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Calculations"]
)
async def create_calculation(
    calculation: schemas.SalaryCalculationBase
):
  """
  Create a new salary calculation.

  - **email**: Email of the consultant
  - **client_name**: Name of the client
  - **hourly_rate**: Hourly rate amount (must be positive)
  - **hours_worked**: Hours worked amount (must be positive)
  - **gross_salary**: Gross salary amount (must be positive)
  - **total_costs**: Total costs amount (must be positive)
  - **notes**: Optional additional notes
  """
  try:
    return service.create_salary_calculation(calculation=calculation)
  except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Error creating calculation: {str(e)}"
    )


# READ - Get all salary calculations
@app.get(
    "/calculations",
    response_model=List[schemas.SalaryCalculationResponse],
    tags=["Calculations"]
)
async def get_calculations(
    skip: int = 0,
    limit: int = 100
):
  """
  Retrieve all salary calculations with pagination.

  - **skip**: Number of records to skip (default: 0)
  - **limit**: Maximum number of records to return (default: 100)
  """
  calculations = service.get_salary_calculations(skip=skip, limit=limit)
  return calculations


# READ - Get a specific salary calculation by ID
@app.get(
    "/calculations/check-duplicate",
    tags=["Calculations"],
)
async def check_duplicate(email: str, client_name: str):
  """
  Check if a calculation exists for a specific email and client in the current month.

  - **email**: The email of the consultant
  - **client_name**: The name of the client
  """
  duplicate = service.check_duplicate_calculation(
      email=email, client_name=client_name
  )
  if duplicate:
    return duplicate
  return {"message": "No duplicate found"}


@app.get(
    "/calculations/email/{email}",
    response_model=List[schemas.SalaryCalculationResponse],
    tags=["Calculations"],
)
async def get_calculations_by_email(email: str):
  """
  Retrieve all salary calculations for a specific user email.

  - **email**: The email of the consultant to retrieve calculations for
  """
  return service.get_salary_calculations_by_email(email=email)


# READ - Get a specific salary calculation by ID
@app.get(
    "/calculations/{calculation_id}",
    response_model=schemas.SalaryCalculationResponse,
    tags=["Calculations"]
)
async def get_calculation(
    calculation_id: str
):
  """
  Retrieve a specific salary calculation by ID.

  - **calculation_id**: The ID of the calculation to retrieve
  """
  calculation = service.get_salary_calculation_by_id(
      calculation_id=calculation_id)
  if calculation is None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Calculation with id {calculation_id} not found"
    )
  return calculation


# UPDATE - Update an existing salary calculation
@app.put(
    "/calculations/{calculation_id}",
    response_model=schemas.SalaryCalculationResponse,
    tags=["Calculations"]
)
async def update_calculation(
    calculation_id: str,
    calculation_update: schemas.SalaryCalculationBase
):
  """
  Update an existing salary calculation.

  - **calculation_id**: The ID of the calculation to update
  - All fields are optional; only provided fields will be updated
  """
  updated_calculation = service.update_salary_calculation(
      calculation_id=calculation_id,
      calculation_update=calculation_update
  )
  if updated_calculation is None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Calculation with id {calculation_id} not found"
    )
  return updated_calculation


# DELETE - Delete a salary calculation
@app.delete(
    "/calculations/{calculation_id}",
    response_model=schemas.MessageResponse,
    tags=["Calculations"]
)
async def delete_calculation(
    calculation_id: str
):
  """
  Delete a salary calculation.

  - **calculation_id**: The ID of the calculation to delete
  """
  success = service.delete_salary_calculation(calculation_id=calculation_id)
  if not success:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Calculation with id {calculation_id} not found"
    )
  return schemas.MessageResponse(
      message=f"Calculation {calculation_id} deleted successfully")


@app.post("/compute-tax", tags=["Calculations"])
async def compute_tax(tax_request: schemas.TaxCalculationRequest):
  """
  Calculate tax by proxying to Skatteverket API.
  """
  return service.calculate_tax(tax_request=tax_request)


if __name__ == "__main__":
  import uvicorn

  host = os.getenv("API_HOST", "0.0.0.0")
  port = int(os.getenv("API_PORT", 8000))
  debug = os.getenv("DEBUG", "True").lower() == "true"

  uvicorn.run(
      "main:app",
      host=host,
      port=port,
      reload=debug
  )
