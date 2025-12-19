#!/usr/bin/env python3
"""
DynamoDB Table Management Script
Utility script for viewing DynamoDB table information

Note: Table creation/deletion is managed by CloudFormation/SAM template.
Use 'sam deploy' to create and 'sam delete' to remove the table.
"""

import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Add shared directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir / 'shared'))

# Load environment variables from backend/.env
load_dotenv(backend_dir / ".env")

from database import get_table
from botocore.exceptions import ClientError


def table_info():
    """Display table information"""
    try:
        table = get_table()
        table.load()
        
        print("\n📊 Table Information:")
        print(f"   Name: {table.table_name}")
        print(f"   Status: {table.table_status}")
        print(f"   Item Count: {table.item_count}")
        print(f"   Size (bytes): {table.table_size_bytes}")
        print(f"   Creation Date: {table.creation_date_time}")
        
        print("\n🔑 Key Schema:")
        for key in table.key_schema:
            print(f"   {key['AttributeName']} ({key['KeyType']})")
        
        print("\n💰 Billing Mode:")
        if hasattr(table, 'billing_mode_summary'):
            print(f"   {table.billing_mode_summary.get('BillingMode', 'N/A')}")
        
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print("❌ Table does not exist. Deploy the SAM template with 'sam deploy' to create it.")
        else:
            print(f"❌ Error getting table info: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def list_items():
    """List all items in the table"""
    try:
        table = get_table()
        response = table.scan(Limit=10)
        items = response.get('Items', [])
        
        if not items:
            print("📭 Table is empty")
            return True
        
        print(f"\n📋 Items in table (showing first 10):")
        for i, item in enumerate(items, 1):
            print(f"\n{i}. ID: {item.get('id')}")
            print(f"   Name: {item.get('name')}")
            print(f"   Gross Salary: ${float(item.get('gross_salary', 0)):,.2f}")
            print(f"   Essential: ${float(item.get('essential_amount', 0)):,.2f} ({float(item.get('essential_percentage', 0))}%)")
            print(f"   Discretionary: ${float(item.get('discretionary_amount', 0)):,.2f} ({float(item.get('discretionary_percentage', 0))}%)")
            print(f"   Created: {item.get('created_at')}")
        
        total_count = table.item_count
        if total_count > 10:
            print(f"\n... and {total_count - 10} more items")
        
        return True
    except Exception as e:
        print(f"❌ Error listing items: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="View DynamoDB table information for eighty-twenty application. "
                    "Note: Use 'sam deploy' to create table and 'sam delete' to remove it."
    )
    
    parser.add_argument(
        'command',
        choices=['info', 'list'],
        help='Command to execute (info: show table details, list: show items)'
    )
    
    args = parser.parse_args()
    
    commands = {
        'info': table_info,
        'list': list_items
    }
    
    success = commands[args.command]()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
