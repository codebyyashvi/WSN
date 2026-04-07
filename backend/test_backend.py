#!/usr/bin/env python3
"""
Backend Testing Script
Tests all endpoints with dummy data to verify the backend is working correctly
"""

import requests
import json
import time
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000/api"

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ {text}{RESET}")

def test_health_check():
    """Test if backend is alive"""
    print_header("1. HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend is running")
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend. Is it running on port 8000?")
        return False
    except Exception as e:
        print_error(f"Health check error: {str(e)}")
        return False

def test_get_sensors():
    """Test getting sensor data"""
    print_header("2. GET SENSORS (Current Data)")
    try:
        response = requests.get(f"{BASE_URL}/sensors", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Sensors retrieved")
            print(f"  Temperature: {data['temperature']}°C")
            print(f"  Humidity: {data['humidity']}%")
            print(f"  Distance: {data['ultrasonic']}cm")
            print(f"  Signal: {data['signal']}%")
            return True
        else:
            print_error(f"Failed to get sensors: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get sensors error: {str(e)}")
        return False

def test_update_sensors():
    """Test sending sensor data to backend"""
    print_header("3. UPDATE SENSORS (Dummy ESP8266 Data)")
    try:
        sensor_data = {
            "ultrasonic": 150.5,
            "temperature": 28.7,
            "humidity": 62.3,
            "signal": 92,
            "zone_id": "zone1"
        }
        print_info(f"Sending data: {sensor_data}")
        
        response = requests.post(
            f"{BASE_URL}/sensors/bulk",
            json=sensor_data,
            timeout=5
        )
        
        if response.status_code == 200:
            print_success("Sensors updated successfully")
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print_error(f"Failed to update sensors: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print_error(f"Update sensors error: {str(e)}")
        return False

def test_get_devices():
    """Test getting device status"""
    print_header("4. GET DEVICES (Current Status)")
    try:
        response = requests.get(f"{BASE_URL}/devices", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Devices retrieved")
            print(f"  LED: {'ON' if data['led_status'] else 'OFF'}")
            print(f"  Buzzer: {'ON' if data['buzzer_status'] else 'OFF'}")
            print(f"  Servo: {'ON' if data['servo_status'] else 'OFF'}")
            return True
        else:
            print_error(f"Failed to get devices: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get devices error: {str(e)}")
        return False

def test_device_control():
    """Test controlling devices"""
    print_header("5. DEVICE CONTROL (Toggle LED/Buzzer/Servo)")
    
    devices_to_test = [
        ("led", "/devices/led", "LED"),
        ("buzzer", "/devices/buzzer", "Buzzer"),
        ("servo", "/devices/servo", "Servo")
    ]
    
    all_success = True
    
    for device_key, endpoint, device_name in devices_to_test:
        try:
            control_data = {f"{device_key}_status": True}
            print_info(f"Turning {device_name} ON...")
            
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json=control_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print_success(f"{device_name} toggled to ON")
            else:
                print_error(f"Failed to control {device_name}: {response.status_code}")
                all_success = False
                
        except Exception as e:
            print_error(f"Device control error ({device_name}): {str(e)}")
            all_success = False
    
    return all_success

def test_get_zones():
    """Test getting zone status"""
    print_header("6. GET ZONES (Security Zones)")
    try:
        response = requests.get(f"{BASE_URL}/zones", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Zones retrieved")
            for zone_id, zone_info in data['zones'].items():
                status = zone_info['status']
                name = zone_info['name']
                print(f"  {zone_id} ({name}): {status}")
            return True
        else:
            print_error(f"Failed to get zones: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get zones error: {str(e)}")
        return False

def test_intruder_alert():
    """Test sending intruder alert"""
    print_header("7. INTRUDER DETECTION (Report Intruder)")
    try:
        intruder_data = {
            "id": f"test_intruder_{int(time.time())}",
            "zone_id": "zone1",
            "timestamp": datetime.now().isoformat(),
            "confidence": 0.95,
            "details": "Test intruder detection"
        }
        print_info(f"Reporting intruder: {intruder_data['id']}")
        
        response = requests.post(
            f"{BASE_URL}/intruders",
            json=intruder_data,
            timeout=5
        )
        
        if response.status_code == 200:
            print_success("Intruder reported successfully")
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print_error(f"Failed to report intruder: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Intruder alert error: {str(e)}")
        return False

def test_get_intruders():
    """Test getting intruders"""
    print_header("8. GET INTRUDERS (Current Alerts)")
    try:
        response = requests.get(f"{BASE_URL}/intruders", timeout=5)
        if response.status_code == 200:
            data = response.json()
            count = data['count']
            print_success(f"Intruders retrieved (Total: {count})")
            if count > 0:
                for intruder in data['intruders']:
                    print(f"  - {intruder['id']} in {intruder['zone_id']} (Confidence: {intruder['confidence']})")
            else:
                print_info("No intruders currently detected")
            return True
        else:
            print_error(f"Failed to get intruders: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get intruders error: {str(e)}")
        return False

def test_dashboard():
    """Test complete dashboard endpoint"""
    print_header("9. DASHBOARD (Complete System Status)")
    try:
        response = requests.get(f"{BASE_URL}/dashboard", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Dashboard data retrieved")
            print(f"\n  SENSORS:")
            print(f"    Temperature: {data['sensors']['temperature']}°C")
            print(f"    Humidity: {data['sensors']['humidity']}%")
            print(f"    Distance: {data['sensors']['ultrasonic']}cm")
            print(f"    Signal: {data['sensors']['signal']}%")
            
            print(f"\n  DEVICES:")
            print(f"    LED: {'ON' if data['devices']['led_status'] else 'OFF'}")
            print(f"    Buzzer: {'ON' if data['devices']['buzzer_status'] else 'OFF'}")
            print(f"    Servo: {'ON' if data['devices']['servo_status'] else 'OFF'}")
            
            print(f"\n  ALERTS:")
            print(f"    Intruders: {data['intruders']['count']}")
            print(f"    Total Alerts: {data['alerts']['count']}")
            
            return True
        else:
            print_error(f"Failed to get dashboard: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Dashboard error: {str(e)}")
        return False

def test_dashboard_summary():
    """Test dashboard summary"""
    print_header("10. DASHBOARD SUMMARY (Quick Status)")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/summary", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Dashboard summary retrieved")
            print(f"  Farm Status: {data['farm_status']}")
            print(f"  Critical Alerts: {data['critical_alerts']}")
            print(f"  Intruders Detected: {data['intruders_detected']}")
            print(f"  Zones at Risk: {data['zones_at_risk']}")
            print(f"  Active Devices: {data['active_devices']}")
            return True
        else:
            print_error(f"Failed to get summary: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Summary error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}")
    print("╔════════════════════════════════════════════════════╗")
    print("║   WSN Backend API Test Suite                       ║")
    print("║   Testing all endpoints with dummy data            ║")
    print("╚════════════════════════════════════════════════════╝")
    print(f"{RESET}\n")
    
    print_info(f"Backend URL: {BASE_URL}")
    print_info("Make sure the backend is running: python main.py")
    
    # Track test results
    results = []
    
    # Run all tests
    results.append(("Health Check", test_health_check()))
    
    if not results[0][1]:
        print_error("\nBackend is not running! Cannot continue tests.")
        print_info("Start the backend with: python main.py")
        return
    
    results.append(("Get Sensors", test_get_sensors()))
    results.append(("Update Sensors", test_update_sensors()))
    time.sleep(0.5)
    results.append(("Get Updated Sensors", test_get_sensors()))
    results.append(("Get Devices", test_get_devices()))
    results.append(("Device Control", test_device_control()))
    time.sleep(0.5)
    results.append(("Get Zones", test_get_zones()))
    results.append(("Intruder Alert", test_intruder_alert()))
    time.sleep(0.5)
    results.append(("Get Intruders", test_get_intruders()))
    results.append(("Dashboard", test_dashboard()))
    results.append(("Dashboard Summary", test_dashboard_summary()))
    
    # Print summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}✓ PASS{RESET}" if result else f"{RED}✗ FAIL{RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n  {BLUE}Total: {passed}/{total} tests passed{RESET}\n")
    
    if passed == total:
        print_success("All tests passed! Backend is working perfectly.")
        print_info("Now you can:")
        print_info("  1. Start the frontend: npm run dev (in frontend directory)")
        print_info("  2. Upload code to ESP8266 with the backend IP and port")
        print_info("  3. Monitor data flow in real-time")
    else:
        print_error(f"Some tests failed ({total - passed} failures)")
        print_info("Check the errors above and restart the backend if needed")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Tests interrupted by user{RESET}\n")
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
