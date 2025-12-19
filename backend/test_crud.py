#!/usr/bin/env python3
"""
Test script to verify DynamoDB connection and CRUD operations
"""

import sys
from datetime import datetime
from pathlib import Path

# Add shared directory to path
sys.path.insert(0, str(Path(__file__).parent / 'shared'))

# Import our modules
from shared import database, crud, schemas


def test_connection():
    """Test DynamoDB connection"""
    print("🔌 Testing DynamoDB connection...")
    try:
        table = database.get_table()
        table.load()
        print(f"✅ Connected to table: {table.table_name}")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False


def test_create():
    """Test creating a calculation"""
    print("\n📝 Testing CREATE operation...")
    try:
        calculation = schemas.SalaryCalculationCreate(
            name="Test Calculation",
            gross_salary=5000.0,
            essential_percentage=80.0,
            discretionary_percentage=20.0,
            notes="This is a test"
        )
        
        result = crud.create_salary_calculation(calculation)
        print(f"✅ Created calculation with ID: {result['id']}")
        print(f"   Essential: ${result['essential_amount']:.2f}")
        print(f"   Discretionary: ${result['discretionary_amount']:.2f}")
        return result['id']
    except Exception as e:
        print(f"❌ Create failed: {str(e)}")
        return None


def test_read(calculation_id):
    """Test reading a calculation"""
    print("\n📖 Testing READ operation...")
    try:
        result = crud.get_salary_calculation(calculation_id)
        if result:
            print(f"✅ Retrieved calculation: {result['name']}")
            print(f"   Gross Salary: ${result['gross_salary']:.2f}")
            return True
        else:
            print("❌ Calculation not found")
            return False
    except Exception as e:
        print(f"❌ Read failed: {str(e)}")
        return False


def test_update(calculation_id):
    """Test updating a calculation"""
    print("\n✏️  Testing UPDATE operation...")
    try:
        update = schemas.SalaryCalculationUpdate(
            gross_salary=6000.0,
            notes="Updated test"
        )
        
        result = crud.update_salary_calculation(calculation_id, update)
        if result:
            print(f"✅ Updated calculation")
            print(f"   New Gross Salary: ${result['gross_salary']:.2f}")
            print(f"   New Essential: ${result['essential_amount']:.2f}")
            return True
        else:
            print("❌ Update failed - calculation not found")
            return False
    except Exception as e:
        print(f"❌ Update failed: {str(e)}")
        return False


def test_list():
    """Test listing calculations"""
    print("\n📋 Testing LIST operation...")
    try:
        results = crud.get_salary_calculations(skip=0, limit=10)
        print(f"✅ Retrieved {len(results)} calculation(s)")
        for calc in results:
            print(f"   - {calc['name']} (${calc['gross_salary']:.2f})")
        return True
    except Exception as e:
        print(f"❌ List failed: {str(e)}")
        return False


def test_delete(calculation_id):
    """Test deleting a calculation"""
    print("\n🗑️  Testing DELETE operation...")
    try:
        success = crud.delete_salary_calculation(calculation_id)
        if success:
            print(f"✅ Deleted calculation with ID: {calculation_id}")
            return True
        else:
            print("❌ Delete failed - calculation not found")
            return False
    except Exception as e:
        print(f"❌ Delete failed: {str(e)}")
        return False


def main():
    print("=" * 60)
    print("🧪 Eighty-Twenty DynamoDB CRUD Test Suite")
    print("=" * 60)
    
    # Test connection
    if not test_connection():
        print("\n❌ Cannot proceed without database connection")
        sys.exit(1)
    
    # Test CRUD operations
    calculation_id = test_create()
    if not calculation_id:
        print("\n❌ Cannot proceed without successful create")
        sys.exit(1)
    
    test_read(calculation_id)
    test_update(calculation_id)
    test_list()
    test_delete(calculation_id)
    
    # Verify deletion
    print("\n🔍 Verifying deletion...")
    result = crud.get_salary_calculation(calculation_id)
    if result is None:
        print("✅ Calculation successfully deleted")
    else:
        print("⚠️  Warning: Calculation still exists after deletion")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
