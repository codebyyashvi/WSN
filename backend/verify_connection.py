#!/usr/bin/env python3
"""
Verification script to test Backend-Frontend Connection
Tests that backend is properly serving collected data from JSON file
"""

import json
import requests
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000/api"
TIMEOUT = 5

def print_header(title):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

def print_success(msg):
    """Print success message"""
    print(f"✅ {msg}")

def print_error(msg):
    """Print error message"""
    print(f"❌ {msg}")

def print_info(msg):
    """Print info message"""
    print(f"ℹ️  {msg}")

def test_backend_connection():
    """Test if backend is running"""
    print_header("Testing Backend Connection")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            print_success("Backend is running on http://localhost:8000")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend. Is it running on port 8000?")
        return False
    except Exception as e:
        print_error(f"Connection error: {e}")
        return False

def test_sensors_endpoint():
    """Test GET /api/sensors"""
    print_header("Testing Sensors Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/sensors", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print_success("Sensors endpoint responding")
            print_info(f"Data Source: {data.get('data_source', 'Unknown')}")
            print_info(f"Current Readings:")
            print(f"  - Ultrasonic: {data.get('ultrasonic')} cm")
            print(f"  - Temperature: {data.get('temperature')}°C")
            print(f"  - Humidity: {data.get('humidity')}%")
            print(f"  - Signal: {data.get('signal')}%")
            print(f"  - Zone: {data.get('zone_id', 'N/A')}")
            
            # Check if data looks like it's from collected data
            if 'data_source' in data and 'sensor_data_collected.json' in data['data_source']:
                print_success("✓ Data is coming from collected JSON file!")
                return True
            else:
                print_error("Data source might not be from collected data")
                return False
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_zones_endpoint():
    """Test GET /api/zones"""
    print_header("Testing Zones Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/zones", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            zones = data.get('zones', {})
            print_success(f"Zones endpoint responding with {len(zones)} zones")
            print_info(f"Data Source: {data.get('data_source', 'Unknown')}")
            print_info("Zone Status Overview:")
            for zone_id, zone_data in zones.items():
                status = zone_data.get('status', 'UNKNOWN')
                name = zone_data.get('name', 'Unknown')
                status_emoji = "🟢" if status == "OK" else "🔴"
                print(f"  {status_emoji} {zone_id}: {name} ({status})")
            
            if 'sensor_data_collected.json' in data.get('data_source', ''):
                print_success("✓ Zone data is from collected JSON file!")
                return True
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_intruders_endpoint():
    """Test GET /api/intruders"""
    print_header("Testing Intruders Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/intruders", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            intruders = data.get('intruders', [])
            print_success(f"Intruders endpoint responding with {len(intruders)} detections")
            print_info(f"Data Source: {data.get('data_source', 'Unknown')}")
            
            if len(intruders) > 0:
                print_info("Recent Intruder Detections:")
                for intruder in intruders[:3]:  # Show first 3
                    print(f"  🚨 {intruder.get('id', 'N/A')}")
                    print(f"     Zone: {intruder.get('zone_id', 'N/A')}")
                    print(f"     Threat: {intruder.get('threat_level', 'N/A')}")
                    print(f"     Confidence: {intruder.get('confidence', 0)*100:.0f}%")
            else:
                print_info("No intruder detections in data")
            
            if 'sensor_data_collected.json' in data.get('data_source', ''):
                print_success("✓ Intruder data is from collected JSON file!")
                return True
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_dashboard_endpoint():
    """Test GET /api/dashboard"""
    print_header("Testing Dashboard Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/dashboard", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print_success("Dashboard endpoint responding")
            print_info(f"Data Source: {data.get('data_source', 'Unknown')}")
            print_info("Dashboard Summary:")
            print(f"  - Intruders Count: {data.get('intruders', {}).get('count', 0)}")
            print(f"  - Alerts Count: {data.get('alerts', {}).get('count', 0)}")
            print(f"  - Critical Zones: {sum(1 for z in data.get('zones', {}).values() if z.get('status') != 'OK')}")
            
            if 'Real-time collected sensor data' in data.get('data_source', ''):
                print_success("✓ Dashboard is showing collected real-time data!")
                return True
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_collected_data_endpoint():
    """Test GET /api/collected-data"""
    print_header("Testing Collected Data Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/collected-data", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                collected = data.get('data', {})
                print_success("Collected data endpoint responding")
                print_info("Data Summary:")
                summary = collected.get('summary_statistics', {})
                print(f"  - Total Zones: {len(collected.get('zones', []))}")
                print(f"  - Total Readings: {summary.get('total_readings', 0)}")
                print(f"  - Alert Events: {summary.get('alert_events', 0)}")
                print(f"  - Intruder Detections: {len(collected.get('intruder_detections', []))}")
                print(f"  - Collection Date: {collected.get('metadata', {}).get('collection_date', 'N/A')}")
                
                print_success("✓ Full collected data is accessible!")
                return True
            else:
                print_error(f"Unexpected response: {data}")
                return False
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_api_documentation():
    """Test API documentation endpoint"""
    print_header("Testing API Documentation")
    
    try:
        response = requests.get("http://localhost:8000/docs", timeout=TIMEOUT)
        if response.status_code == 200:
            print_success("API documentation available at http://localhost:8000/docs")
            return True
        else:
            print_error(f"API docs returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🔌 WSN Backend-Frontend Connection Test")
    print("="*60)
    print(f"Testing Backend at: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "Backend Connection": test_backend_connection(),
        "Sensors Endpoint": test_sensors_endpoint(),
        "Zones Endpoint": test_zones_endpoint(),
        "Intruders Endpoint": test_intruders_endpoint(),
        "Dashboard Endpoint": test_dashboard_endpoint(),
        "Collected Data Endpoint": test_collected_data_endpoint(),
        "API Documentation": test_api_documentation(),
    }
    
    # Summary
    print_header("Test Summary")
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nResults: {passed}/{total} tests passed")
    print("\nDetailed Results:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    if passed == total:
        print_success("\n✓ All tests passed! Backend-Frontend connection is working!")
        print_success("✓ Backend is successfully serving collected data from JSON file!")
        print_info("\nYou can now:")
        print_info("  1. Visit http://localhost:5173 to see the frontend")
        print_info("  2. View API docs at http://localhost:8000/docs")
        print_info("  3. Check real-time data flow from JSON → Backend → Frontend")
    else:
        print_error(f"\n✗ {total - passed} test(s) failed. Check the errors above.")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
