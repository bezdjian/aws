import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Dict, Any

import requests
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr

from . import database
from . import schemas
from .SsmService import get_google_client_id
from .TokenInfo import TokenInfo

google_auth_url = "https://oauth2.googleapis.com"


def decimal_to_float(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def float_to_decimal(value: float) -> Decimal:
    """Convert float to Decimal for DynamoDB"""
    return Decimal(str(value))


def item_to_dict(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB item to regular dict with floats"""
    result = {}
    for key, value in item.items():
        if isinstance(value, Decimal):
            result[key] = float(value)
        else:
            result[key] = value
    return result


def serialize_item(item: dict) -> dict:
    """Convert datetime objects to ISO format strings for DynamoDB"""
    serialized = {}
    for key, value in item.items():
        if isinstance(value, datetime):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized


def create_salary_calculation(calculation: schemas.SalaryCalculationBase) -> Dict[str, Any]:
    """Create a new salary calculation in DynamoDB"""
    table = database.get_table()

    # Generate unique ID
    calculation_id = str(uuid.uuid4())

    # Prepare item for DynamoDB
    item = {
        'id': calculation_id,
        'email': calculation.email,
        'client_name': calculation.client_name,
        'hourly_rate': float_to_decimal(calculation.hourly_rate),
        'hours_worked': calculation.hours_worked,
        'invoiced_amount': float_to_decimal(calculation.invoiced_amount),
        'after_deduction': float_to_decimal(calculation.after_deduction),
        'save_to_buffer': float_to_decimal(calculation.save_to_buffer),
        'gross_salary': float_to_decimal(calculation.gross_salary),
        'remaining_salary': float_to_decimal(calculation.remaining_salary),
        'remaining_for_gross_salary': float_to_decimal(calculation.remaining_for_gross_salary),
        'employer_fee': float_to_decimal(calculation.employer_fee),
        'notes': calculation.notes,
        'date': calculation.date,
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }

    item = serialize_item(item)
    # Put item in DynamoDB
    table.put_item(Item=item)

    return item_to_dict(item)


# TODO: By email or consultant's unique ID?
def get_salary_calculation_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get a salary calculation by email from DynamoDB"""
    table = database.get_table()

    try:
        response = table.get_item(Key={'email': email})
        item = response.get('Item')

        if item:
            return item_to_dict(item)
        return None

    except ClientError as e:
        print(f"Error getting item: {e.response['Error']['Message']}")
        return None


def get_salary_calculation_by_id(calculation_id: str) -> Optional[Dict[str, Any]]:
    """Get a salary calculation by ID from DynamoDB"""
    table = database.get_table()

    try:
        response = table.get_item(Key={'id': calculation_id})
        item = response.get('Item')

        if item:
            return item_to_dict(item)
        return None

    except ClientError as e:
        print(f"Error getting item: {e.response['Error']['Message']}")
        return None


def get_salary_calculations(skip: int = 0, limit: int = 100) -> List[schemas.SalaryCalculationResponse]:
    """Get all salary calculations from DynamoDB with pagination"""
    table = database.get_table()

    try:
        # Scan the table (Note: For production with large datasets, consider using Query with GSI)
        response = table.scan(Limit=limit + skip)
        items = response.get('Items', [])

        # Handle pagination if there are more items
        while 'LastEvaluatedKey' in response and len(items) < (limit + skip):
            response = table.scan(
                Limit=limit + skip - len(items),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        # Apply skip and limit
        items = items[skip:skip + limit]

        # Sort by date (most recent first)
        items.sort(key=lambda x: x.get('date', ''), reverse=True)

        return [
            schemas.SalaryCalculationResponse(**item_to_dict(item))
            for item in items
        ]

    except ClientError as e:
        print(f"Error scanning table: {e.response['Error']['Message']}")
        return []


def get_salary_calculations_by_email(
    email: str,
) -> List[schemas.SalaryCalculationResponse]:
    """Get all salary calculations for a specific email from DynamoDB"""
    table = database.get_table()

    try:
        # Use scan with a FilterExpression
        response = table.scan(FilterExpression=Attr("email").eq(email))
        items = response.get("Items", [])

        # Sort by date (most recent first)
        items.sort(
            key=lambda x: (
                x.get("date", "") if x.get("date") else x.get("created_at", "")
            ),
            reverse=True,
        )

        return [
            schemas.SalaryCalculationResponse(**item_to_dict(item)) for item in items
        ]

    except ClientError as e:
        print(f"Error scanning by email: {e.response['Error']['Message']}")
        return []


def update_salary_calculation(
        calculation_id: str,
        calculation_update: schemas.SalaryCalculationBase
) -> Optional[Dict[str, Any]]:
    """Update an existing salary calculation in DynamoDB"""
    table = database.get_table()

    # First, get the existing item
    existing_item = get_salary_calculation_by_id(calculation_id)
    if not existing_item:
        return None

    # Prepare update data
    update_data = calculation_update.model_dump(exclude_unset=True)

    if not update_data:
        return existing_item

    # Build update expression
    update_expression_parts = []
    expression_attribute_values = {}
    expression_attribute_names = {}

    # Update timestamp
    now = datetime.now(tz=timezone.utc).isoformat()
    update_expression_parts.append("#updated_at = :updated_at")
    expression_attribute_names["#updated_at"] = "updated_at"
    expression_attribute_values[":updated_at"] = now

    # Process each field
    for field, value in update_data.items():
        attr_name = f"#{field}"
        attr_value = f":{field}"

        expression_attribute_names[attr_name] = field

        if isinstance(value, float):
            expression_attribute_values[attr_value] = float_to_decimal(value)
        else:
            expression_attribute_values[attr_value] = value

        update_expression_parts.append(f"{attr_name} = {attr_value}")

    try:
        response = table.update_item(
            Key={'id': calculation_id},
            UpdateExpression=update_expression_parts,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return item_to_dict(response['Attributes'])

    except ClientError as e:
        print(f"Error updating item: {e.response['Error']['Message']}")
        return None


def delete_salary_calculation(calculation_id: str) -> bool:
    """Delete a salary calculation from DynamoDB"""
    table = database.get_table()

    # Check if item exists
    if not get_salary_calculation_by_id(calculation_id):
        return False

    try:
        table.delete_item(Key={'id': calculation_id})
        return True

    except ClientError as e:
        print(f"Error deleting item: {e.response['Error']['Message']}")
        return False


def verify_token(token: str) -> Dict[str, Any]:
    """Verify the provided token with Google and return user info"""
    try:
        # Use Google's tokeninfo endpoint
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )

        if response.status_code != 200:
            print(f"Token verification failed: {response.text}")
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Invalid Google token")

        data = response.json()

        # Map Google fields to what our frontend expects
        return {
            "fullname": data.get("name"),
            "email": data.get("email"),
            "pictureUrl": data.get("picture"),
            "googleId": data.get("sub"),
            "userId": data.get("sub"),  # Use sub as userId for now
            "given_name": data.get("given_name"),
            "family_name": data.get("family_name"),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying token: {e}")
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=str(e))


def get_client_id() -> Optional[str]:
    """Verify the provided token (stub implementation)"""
    return get_google_client_id()


def validate_token(token_info: TokenInfo):
    """Validate the token information"""

    if token_info is None:
        raise RuntimeError("Invalid ID token.")

    if "accounts.google.com" not in token_info.iss():
        raise RuntimeError(f"Invalid issuer: {token_info.iss()}")

    if token_info.aud() != get_client_id():  # TODO: Cache client ID or make a better call
        raise RuntimeError(f"Invalid audience: {token_info.aud()}")

    if token_info.hd() != "solidbeans.com" and not token_info.email_verified():
        raise RuntimeError(f"Invalid domain or unverified email: {token_info.hd()}")

    if token_info.sub() is None:
        raise RuntimeError("Invalid sub. GoogleId is null.")

    if 0 < token_info.exp() < (datetime.now().timestamp()):
        raise RuntimeError("Token has expired.")


def calculate_tax(tax_request: schemas.TaxCalculationRequest) -> Dict[str, Any]:
    """Calculate tax by proxying to Skatteverket API"""
    url = "https://www7.skatteverket.se/portal-wapi/open/skatteberakning/v1/api/skattetabell/2025/beraknaSkatteavdrag"
    data = {
        "skattesats": tax_request.tax_rate,
        "inkomst": tax_request.gross_salary,
        "fodelsear": tax_request.birth_year,
        "typ": tax_request.type,
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error calculating tax: {e}")
        from fastapi import HTTPException

        raise HTTPException(
            status_code=500, detail=f"Error calculating tax from Skatteverket: {str(e)}"
        )
