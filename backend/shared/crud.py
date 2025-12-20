import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any

from botocore.exceptions import ClientError

from . import database
from . import schemas


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
        'total_costs': float_to_decimal(calculation.total_costs),
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


def get_salary_calculation(calculation_id: str) -> Optional[Dict[str, Any]]:
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


def update_salary_calculation(
        email: str,
        calculation_update: schemas.SalaryCalculationBase
) -> Optional[Dict[str, Any]]:
    """Update an existing salary calculation in DynamoDB"""
    table = database.get_table()

    # First, get the existing item
    existing_item = get_salary_calculation_by_email(email)
    if not existing_item:
        return None

    # Prepare update data
    update_data = calculation_update.dict(exclude_unset=True)

    if not update_data:
        return existing_item

    # Build update expression
    update_expression_parts = []
    expression_attribute_values = {}
    expression_attribute_names = {}

    # Update timestamp
    now = datetime.utcnow().isoformat()
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
            Key={'email': email},
            UpdateExpression=update_expression,
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
    if not get_salary_calculation(calculation_id):
        return False

    try:
        table.delete_item(Key={'id': calculation_id})
        return True

    except ClientError as e:
        print(f"Error deleting item: {e.response['Error']['Message']}")
        return False
