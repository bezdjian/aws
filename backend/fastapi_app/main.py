from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path to import shared module
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from shared import crud, schemas

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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


# CREATE - Create a new salary calculation
@app.post(
    "/calculations",
    response_model=schemas.SalaryCalculationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Calculations"]
)
async def create_calculation(
    calculation: schemas.SalaryCalculationCreate
):
    """
    Create a new salary calculation.
    
    - **name**: Name or description of the calculation
    - **gross_salary**: Gross salary amount (must be positive)
    - **essential_percentage**: Percentage for essentials (default: 80%)
    - **discretionary_percentage**: Percentage for discretionary spending (default: 20%)
    - **notes**: Optional additional notes
    """
    try:
        return crud.create_salary_calculation(calculation=calculation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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
    calculations = crud.get_salary_calculations(skip=skip, limit=limit)
    return calculations


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
    calculation = crud.get_salary_calculation(calculation_id=calculation_id)
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
    calculation_update: schemas.SalaryCalculationUpdate
):
    """
    Update an existing salary calculation.
    
    - **calculation_id**: The ID of the calculation to update
    - All fields are optional; only provided fields will be updated
    """
    updated_calculation = crud.update_salary_calculation(
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
    success = crud.delete_salary_calculation(calculation_id=calculation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Calculation with id {calculation_id} not found"
        )
    return schemas.MessageResponse(message=f"Calculation {calculation_id} deleted successfully")


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
