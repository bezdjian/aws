"""
Lambda handlers for AWS API Gateway integration
Adapts the existing CRUD operations to work with Lambda events
Note: DynamoDB table is created by CloudFormation/SAM template
"""

import json
import sys
from decimal import Decimal
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path to import shared module
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared import service, schemas


class DecimalEncoder(json.JSONEncoder):
  """Helper class to convert Decimal to float for JSON serialization"""

  def default(self, obj):
    if isinstance(obj, Decimal):
      return float(obj)
    return super(DecimalEncoder, self).default(obj)


def create_response(status_code: int, body: Any) -> Dict[str, Any]:
  """Create a standardized API Gateway response"""
  return {
    "statusCode": status_code,
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
    "body": json.dumps(body, cls=DecimalEncoder),
  }


def create_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for creating a new salary calculation
  POST /calculations
  """
  try:
    # Parse request body
    body = json.loads(event.get("body", "{}"))

    # Validate and create calculation
    calculation = schemas.SalaryCalculationBase(**body)
    result = service.create_salary_calculation(calculation)

    return create_response(201, result)

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except ValueError as e:
    return create_response(400, {"error": str(e)})
  except Exception as e:
    print(f"Error creating calculation: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_calculations(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for getting all salary calculations
  GET /calculations?skip=0&limit=100
  """
  try:
    # Parse query parameters
    query_params = event.get("queryStringParameters") or {}
    skip = int(query_params.get("skip", 0))
    limit = int(query_params.get("limit", 100))

    # Get calculations
    results = service.get_salary_calculations(skip=skip, limit=limit)

    return create_response(200, results)

  except ValueError as e:
    return create_response(400,
                           {"error": f"Invalid query parameters: {str(e)}"})
  except Exception as e:
    print(f"Error getting calculations: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for getting a specific salary calculation
  GET /calculations/{id}
  """
  try:
    # Get calculation ID from path parameters
    path_params = event.get("pathParameters") or {}
    calculation_id = path_params.get("id")

    if not calculation_id:
      return create_response(400, {"error": "Missing calculation ID"})

    # Get calculation
    result = service.get_salary_calculation_by_id(calculation_id)

    if result is None:
      return create_response(
          404, {"error": f"Calculation with id {calculation_id} not found"}
      )

    return create_response(200, result)

  except Exception as e:
    print(f"Error getting calculation: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_calculations_by_email(event: Dict[str, Any], context: Any) -> Dict[
  str, Any]:
  """
  Lambda handler for getting salary calculations by user email
  GET /calculations/email/{email}
  """
  try:
    path_params = event.get("pathParameters") or {}
    email = path_params.get("email")

    if not email:
      return create_response(400, {"error": "Missing email"})

    results = service.get_salary_calculations_by_email(email)
    return create_response(200, results)
  except Exception as e:
    print(f"Error getting calculations by email: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def check_duplicate(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for checking duplicate calculations
  GET /calculations/check-duplicate?email=...&client_name=...
  """
  try:
    # Parse query parameters
    query_params = event.get("queryStringParameters") or {}
    email = query_params.get("email")
    client_name = query_params.get("client_name")

    if not email or not client_name:
      return create_response(400, {"error": "Missing email or client_name"})

    # Check for duplicate
    result = service.check_duplicate_calculation(email, client_name)

    if result:
      return create_response(200, result)

    return create_response(200, {"message": "No duplicate found"})

  except Exception as e:
    print(f"Error checking duplicate: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def update_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for updating a salary calculation
  PUT /calculations/{id}
  """
  try:
    # Get calculation ID from path parameters
    path_params = event.get("pathParameters") or {}
    calculation_id = path_params.get("id")

    if not calculation_id:
      return create_response(400, {"error": "Missing calculation ID"})

    # Parse request body
    body = json.loads(event.get("body", "{}"))

    # Validate and update calculation
    calculation_update = schemas.SalaryCalculationBase(**body)
    result = service.update_salary_calculation(
        calculation_id=calculation_id, calculation_update=calculation_update
    )

    if result is None:
      return create_response(
          404, {"error": f"Calculation with id {calculation_id} not found"}
      )

    return create_response(200, result)

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except ValueError as e:
    return create_response(400, {"error": str(e)})
  except Exception as e:
    print(f"Error updating calculation: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def delete_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for deleting a salary calculation
  DELETE /calculations/{id}
  """
  try:
    # Get calculation ID from path parameters
    path_params = event.get("pathParameters") or {}
    calculation_id = path_params.get("id")

    if not calculation_id:
      return create_response(400, {"error": "Missing calculation ID"})

    # Delete calculation
    success = service.delete_salary_calculation(calculation_id)

    if not success:
      return create_response(
          404, {"error": f"Calculation with id {calculation_id} not found"}
      )

    return create_response(
        200, {"message": f"Calculation {calculation_id} deleted successfully"}
    )

  except Exception as e:
    print(f"Error deleting calculation: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_settings(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for getting user settings
  GET /settings/{email}
  """
  try:
    path_params = event.get("pathParameters") or {}
    email = path_params.get("email")

    if not email:
      return create_response(400, {"error": "Missing email"})

    result = service.get_user_settings(email)
    return create_response(200, result)

  except Exception as e:
    print(f"Error getting settings: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def update_settings(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for updating user settings
  POST /settings
  """
  try:
    body = json.loads(event.get("body", "{}"))
    settings = schemas.UserSettings(**body)
    result = service.update_user_settings(settings)
    return create_response(200, result)

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except ValueError as e:
    return create_response(400, {"error": str(e)})
  except Exception as e:
    print(f"Error updating settings: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def analyze_insights(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for analyzing financial insights with AI
  POST /insights/analyze
  """
  try:
    from shared.ai_agent import AIAgent

    body = json.loads(event.get("body", "{}"))
    stats = schemas.InsightStats(**body)
    agent = AIAgent()
    response = agent.get_financial_insights(stats)
    return create_response(200, {"response": response})

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except Exception as e:
    print(f"Error analyzing insights: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


# Health check handler (optional)
def health_check(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for health check
  GET /health
  """
  return create_response(
      200,
      {"status": "healthy", "service": "eighty-twenty-api", "version": "1.0.0"}
  )


def compute_tax(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for computing tax
  POST /compute-tax
  """
  try:
    body = json.loads(event.get("body", "{}"))
    tax_request = schemas.TaxCalculationRequest(**body)
    result = service.calculate_tax(tax_request)
    return create_response(200, result)

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except Exception as e:
    print(f"Error computing tax: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_presigned_url(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for getting a presigned URL for a report
  GET /reports/presigned-url?email=...&client_name=...&date=...&expiration=...
  """
  try:
    query_params = event.get("queryStringParameters") or {}
    email = query_params.get("email")
    client_name = query_params.get("client_name")
    date = query_params.get("date")
    expiration = int(query_params.get("expiration", 3600))

    if not all([email, client_name, date]):
      return create_response(
          400,
          {
            "error": "Missing required parameters: email, client_name, or date"
          },
      )

    result = service.generate_report_presigned_url(
        email=email, client_name=client_name, date=date, expiration=expiration
    )

    if result is None:
      return create_response(404, {"error": "Report not found"})

    return create_response(200, result)
  except Exception as e:
    print(f"Error getting presigned URL: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def verify_auth(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for verifying Google authentication token
  POST /auth/verify
  """
  try:
    body = json.loads(event.get("body", "{}"))
    token_verify = schemas.TokenVerify(**body)
    result = service.verify_token(token=token_verify.token)
    return create_response(200, result)

  except json.JSONDecodeError:
    return create_response(400, {"error": "Invalid JSON in request body"})
  except Exception as e:
    print(f"Error verifying token: {str(e)}")
    return create_response(500, {"error": "Internal server error"})


def get_google_client_id(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
  """
  Lambda handler for getting the Google Client ID
  GET /auth/client_id
  """
  try:
    result = service.get_client_id()
    if result is None:
      return create_response(500, {"error": "Google Client ID not found"})

    response = create_response(200, result)
    response["headers"]["Cache-Control"] = "public, max-age=3600"
    return response

  except Exception as e:
    print(f"Error getting Google Client ID: {str(e)}")
    return create_response(500, {"error": "Internal server error"})
