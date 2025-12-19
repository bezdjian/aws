from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class SalaryCalculationBase(BaseModel):
    """Base schema for salary calculation"""
    name: str = Field(..., min_length=1, max_length=100, description="Name or description of the calculation")
    gross_salary: float = Field(..., gt=0, description="Gross salary amount")
    essential_percentage: float = Field(default=80.0, ge=0, le=100, description="Percentage for essentials")
    discretionary_percentage: float = Field(default=20.0, ge=0, le=100, description="Percentage for discretionary spending")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")

    @validator('discretionary_percentage')
    def validate_percentages(cls, v, values):
        """Ensure percentages add up to 100"""
        if 'essential_percentage' in values:
            total = values['essential_percentage'] + v
            if abs(total - 100.0) > 0.01:  # Allow for floating point precision
                raise ValueError(f'Percentages must add up to 100. Got {total}')
        return v


class SalaryCalculationCreate(SalaryCalculationBase):
    """Schema for creating a new salary calculation"""
    pass


class SalaryCalculationUpdate(BaseModel):
    """Schema for updating an existing salary calculation"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    gross_salary: Optional[float] = Field(None, gt=0)
    essential_percentage: Optional[float] = Field(None, ge=0, le=100)
    discretionary_percentage: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=500)


class SalaryCalculationResponse(SalaryCalculationBase):
    """Schema for salary calculation response"""
    id: str  # UUID string for DynamoDB
    essential_amount: float
    discretionary_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
