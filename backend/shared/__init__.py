"""
Shared business logic for eighty-twenty application.
Used by both FastAPI and Lambda implementations.
"""

from . import ai_agent
from .database import get_table, get_dynamodb_resource, get_dynamodb_client
from .schemas import (
  SalaryCalculationBase,
  SalaryCalculationResponse,
  MessageResponse,
  InsightStats
)
from .service import (
  create_salary_calculation,
  get_salary_calculation_by_id,
  get_salary_calculations,
  update_salary_calculation,
  delete_salary_calculation,
)

__all__ = [
  # CRUD operations
  "create_salary_calculation",
  "get_salary_calculation_by_id",
  "get_salary_calculations",
  "update_salary_calculation",
  "delete_salary_calculation",
  # Database
  "get_table",
  "get_dynamodb_resource",
  "get_dynamodb_client",
  # Schemas
  "SalaryCalculationBase",
  "SalaryCalculationResponse",
  "MessageResponse",
  "InsightStats"
]
