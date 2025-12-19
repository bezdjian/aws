"""
Lambda handlers for AWS API Gateway integration
Adapts the existing CRUD operations to work with Lambda events
Note: DynamoDB table is created by CloudFormation/SAM template
"""

import json
import os
import sys
from typing import Dict, Any
from decimal import Decimal
from pathlib import Path

# Add parent directory to path to import shared module
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared import crud, schemas


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def create_response(status_code: int, body: Any) -> Dict[str, Any]:
    """Create a standardized API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }


def create_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for creating a new salary calculation
    POST /calculations
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate and create calculation
        calculation = schemas.SalaryCalculationCreate(**body)
        result = crud.create_salary_calculation(calculation)
        
        return create_response(201, result)
        
    except json.JSONDecodeError:
        return create_response(400, {'error': 'Invalid JSON in request body'})
    except ValueError as e:
        return create_response(400, {'error': str(e)})
    except Exception as e:
        print(f"Error creating calculation: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})


def get_calculations(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for getting all salary calculations
    GET /calculations?skip=0&limit=100
    """
    try:
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        skip = int(query_params.get('skip', 0))
        limit = int(query_params.get('limit', 100))
        
        # Get calculations
        results = crud.get_salary_calculations(skip=skip, limit=limit)
        
        return create_response(200, results)
        
    except ValueError as e:
        return create_response(400, {'error': f'Invalid query parameters: {str(e)}'})
    except Exception as e:
        print(f"Error getting calculations: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})


def get_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for getting a specific salary calculation
    GET /calculations/{id}
    """
    try:
        # Get calculation ID from path parameters
        path_params = event.get('pathParameters') or {}
        calculation_id = path_params.get('id')
        
        if not calculation_id:
            return create_response(400, {'error': 'Missing calculation ID'})
        
        # Get calculation
        result = crud.get_salary_calculation(calculation_id)
        
        if result is None:
            return create_response(404, {'error': f'Calculation with id {calculation_id} not found'})
        
        return create_response(200, result)
        
    except Exception as e:
        print(f"Error getting calculation: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})


def update_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for updating a salary calculation
    PUT /calculations/{id}
    """
    try:
        # Get calculation ID from path parameters
        path_params = event.get('pathParameters') or {}
        calculation_id = path_params.get('id')
        
        if not calculation_id:
            return create_response(400, {'error': 'Missing calculation ID'})
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate and update calculation
        calculation_update = schemas.SalaryCalculationUpdate(**body)
        result = crud.update_salary_calculation(calculation_id, calculation_update)
        
        if result is None:
            return create_response(404, {'error': f'Calculation with id {calculation_id} not found'})
        
        return create_response(200, result)
        
    except json.JSONDecodeError:
        return create_response(400, {'error': 'Invalid JSON in request body'})
    except ValueError as e:
        return create_response(400, {'error': str(e)})
    except Exception as e:
        print(f"Error updating calculation: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})


def delete_calculation(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for deleting a salary calculation
    DELETE /calculations/{id}
    """
    try:
        # Get calculation ID from path parameters
        path_params = event.get('pathParameters') or {}
        calculation_id = path_params.get('id')
        
        if not calculation_id:
            return create_response(400, {'error': 'Missing calculation ID'})
        
        # Delete calculation
        success = crud.delete_salary_calculation(calculation_id)
        
        if not success:
            return create_response(404, {'error': f'Calculation with id {calculation_id} not found'})
        
        return create_response(200, {'message': f'Calculation {calculation_id} deleted successfully'})
        
    except Exception as e:
        print(f"Error deleting calculation: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})


# Health check handler (optional)
def health_check(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for health check
    GET /health
    """
    return create_response(200, {
        'status': 'healthy',
        'service': 'eighty-twenty-api',
        'version': '1.0.0'
    })
