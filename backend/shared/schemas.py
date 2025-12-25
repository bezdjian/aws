from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class SalaryCalculationBase(BaseModel):
  """Base schema for salary calculation"""

  email: str = Field(
      ..., min_length=1, max_length=100, description="Email of the consultant"
  )
  client_name: str = Field(
      default="General",
      min_length=1,
      max_length=100,
      description="Name of the client",
  )
  hourly_rate: float = Field(default=800, gt=0,
                             description="Hourly rate amount")
  hours_worked: int = Field(default=160, gt=0,
                            description="Hours worked amount")
  invoiced_amount: float = Field(
      default=128000,
      gt=0,
      description="Invoiced amount, calculated by hourly_rate * hours_worked",
  )
  after_deduction: float = Field(
      default=102400,
      gt=0,
      description="After deduction amount, 80% - invoiced_amount",
  )
  save_to_buffer: float = Field(
      default=10000, gt=0, description="Save to buffer amount"
  )
  pension_saving: float = Field(
      default=3000, gt=0, description="Pension saving amount"
  )
  gross_salary: float = Field(
      default=92400,
      gt=0,
      description="Gross salary amount after deduction and save to buffer",
  )

  remaining_salary: float = Field(
      default=88050, gt=0,
      description="Remaining salary amount after total costs"
  )
  remaining_for_gross_salary: float = Field(
      default=66999,
      gt=0,
      description="Remaining salary for gross salary amount after total costs",
  )
  employer_fee: float = Field(
      default=21051, gt=0, description="Employer fee amount after total costs"
  )

  notes: Optional[str] = Field(None, max_length=500,
                               description="Additional notes")
  date: Optional[datetime] = Field(None, description="Date of the calculation")

  created_at: Optional[datetime] = Field(
      default_factory=datetime.now, description="Date and time of creation"
  )
  updated_at: Optional[datetime] = Field(
      default_factory=datetime.now, description="Date and time of last update"
  )

  @validator("gross_salary")
  def validate_total_costs(cls, v, values):
    """Ensure total costs is less than gross salary"""
    if "gross_salary" in values and v > values["gross_salary"]:
      raise ValueError(f"Total costs must be less than gross salary. Got {v}")
    return v


class SalaryCalculationResponse(SalaryCalculationBase):
  """Schema for salary calculation response"""

  id: str  # UUID string for DynamoDB
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class MessageResponse(BaseModel):
  """Generic message response"""

  message: str


class TokenVerify(BaseModel):
  """Schema for token verification"""

  token: str


class TaxCalculationRequest(BaseModel):
  """Schema for tax calculation request"""

  gross_salary: int
  birth_year: int = 1987
  tax_rate: int = 32
  type: str = "L"


class UserSettings(BaseModel):
  """Schema for user settings"""

  email: str = Field(..., description="Email of the consultant")
  default_tax_rate: float = Field(default=32.0, ge=0, le=100)
  default_buffer_amount: float = Field(default=10000.0, ge=0)
  default_hourly_rate: float = Field(default=800.0, ge=0)
  updated_at: Optional[datetime] = Field(default_factory=datetime.now)

  class Config:
    from_attributes = True

class InsightStats(BaseModel):
  """Schema for insight statistics"""
  total_gross_salary: int
  total_invoiced: int
  hourly_rate: int
  total_buffer: int
  count: int


class AIQuestion(BaseModel):
  """Schema for AI question request"""

  question: str


class AIResponse(BaseModel):
  """Schema for AI response"""

  response: str
