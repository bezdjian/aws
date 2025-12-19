from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid
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


def calculate_amounts(gross_salary: float, essential_percentage: float, discretionary_percentage: float):
    """Calculate essential and discretionary amounts"""
    essential_amount = (gross_salary * essential_percentage) / 100
    discretionary_amount = (gross_salary * discretionary_percentage) / 100
    return essential_amount, discretionary_amount


def item_to_dict(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB item to regular dict with floats"""
    result = {}
    for key, value in item.items():
        if isinstance(value, Decimal):
            result[key] = float(value)
        else:
            result[key] = value
    return result


def create_salary_calculation(calculation: schemas.SalaryCalculationCreate) -> Dict[str, Any]:
    """Create a new salary calculation in DynamoDB"""
    table = database.get_table()
    
    # Calculate amounts
    essential_amount, discretionary_amount = calculate_amounts(
        calculation.gross_salary,
        calculation.essential_percentage,
        calculation.discretionary_percentage
    )
    
    # Generate unique ID
    calculation_id = str(uuid.uuid4())
    
    # Prepare item for DynamoDB
    now = datetime.utcnow().isoformat()
    item = {
        'id': calculation_id,
        'name': calculation.name,
        'gross_salary': float_to_decimal(calculation.gross_salary),
        'essential_percentage': float_to_decimal(calculation.essential_percentage),
        'discretionary_percentage': float_to_decimal(calculation.discretionary_percentage),
        'essential_amount': float_to_decimal(essential_amount),
        'discretionary_amount': float_to_decimal(discretionary_amount),
        'notes': calculation.notes or '',
        'created_at': now,
        'updated_at': now
    }
    
    # Put item in DynamoDB
    table.put_item(Item=item)
    
    return item_to_dict(item)


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


def get_salary_calculations(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
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
        
        # Sort by created_at (most recent first)
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return [item_to_dict(item) for item in items]
        
    except ClientError as e:
        print(f"Error scanning table: {e.response['Error']['Message']}")
        return []


def update_salary_calculation(
    calculation_id: str,
    calculation_update: schemas.SalaryCalculationUpdate
) -> Optional[Dict[str, Any]]:
    """Update an existing salary calculation in DynamoDB"""
    table = database.get_table()
    
    # First, get the existing item
    existing_item = get_salary_calculation(calculation_id)
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
    
    # Recalculate amounts if necessary
    gross_salary = update_data.get('gross_salary', existing_item['gross_salary'])
    essential_percentage = update_data.get('essential_percentage', existing_item['essential_percentage'])
    discretionary_percentage = update_data.get('discretionary_percentage', existing_item['discretionary_percentage'])
    
    if any(field in update_data for field in ['gross_salary', 'essential_percentage', 'discretionary_percentage']):
        essential_amount, discretionary_amount = calculate_amounts(
            gross_salary,
            essential_percentage,
            discretionary_percentage
        )
        
        expression_attribute_names["#essential_amount"] = "essential_amount"
        expression_attribute_names["#discretionary_amount"] = "discretionary_amount"
        expression_attribute_values[":essential_amount"] = float_to_decimal(essential_amount)
        expression_attribute_values[":discretionary_amount"] = float_to_decimal(discretionary_amount)
        
        update_expression_parts.append("#essential_amount = :essential_amount")
        update_expression_parts.append("#discretionary_amount = :discretionary_amount")
    
    update_expression = "SET " + ", ".join(update_expression_parts)
    
    try:
        response = table.update_item(
            Key={'id': calculation_id},
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
