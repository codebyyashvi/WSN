# Backend API Testing - cURL Commands

Test the backend API manually using these cURL commands.

## Prerequisites
- Backend running: `python main.py`
- cURL installed (comes with Windows 10+)

## Quick Test Commands

### 1. Health Check
```powershell
curl http://localhost:8000/api/health
```
Expected: `{"status":"healthy","timestamp":"...","version":"1.0.0"}`

### 2. Get Current Sensors
```powershell
curl http://localhost:8000/api/sensors
```

### 3. Send Sensor Data (Simulate ESP8266)
```powershell
curl -X POST http://localhost:8000/api/sensors/bulk `
  -H "Content-Type: application/json" `
  -d '{
    "ultrasonic": 150,
    "temperature": 28.5,
    "humidity": 65,
    "signal": 90,
    "zone_id": "zone1"
  }'
```

### 4. Get Device Status
```powershell
curl http://localhost:8000/api/devices
```

### 5. Turn LED On
```powershell
curl -X POST http://localhost:8000/api/devices/led `
  -H "Content-Type: application/json" `
  -d '{"led_status": true}'
```

### 6. Turn Buzzer On
```powershell
curl -X POST http://localhost:8000/api/devices/buzzer `
  -H "Content-Type: application/json" `
  -d '{"buzzer_status": true}'
```

### 7. Turn Servo On
```powershell
curl -X POST http://localhost:8000/api/devices/servo `
  -H "Content-Type: application/json" `
  -d '{"servo_status": true}'
```

### 8. Control Multiple Devices
```powershell
curl -X POST http://localhost:8000/api/devices/control `
  -H "Content-Type: application/json" `
  -d '{
    "led_status": true,
    "buzzer_status": false,
    "servo_status": true
  }'
```

### 9. Get All Zones
```powershell
curl http://localhost:8000/api/zones
```

### 10. Report Intruder
```powershell
curl -X POST http://localhost:8000/api/intruders `
  -H "Content-Type: application/json" `
  -d '{
    "id": "intruder_001",
    "zone_id": "zone1",
    "timestamp": "2026-04-07T10:30:00",
    "confidence": 0.95,
    "details": "Motion detected"
  }'
```

### 11. Get All Intruders
```powershell
curl http://localhost:8000/api/intruders
```

### 12. Clear Specific Intruder
```powershell
curl -X DELETE http://localhost:8000/api/intruders/intruder_001
```

### 13. Clear All Intruders
```powershell
curl -X DELETE http://localhost:8000/api/intruders
```

### 14. Get Dashboard
```powershell
curl http://localhost:8000/api/dashboard
```

### 15. Get Dashboard Summary
```powershell
curl http://localhost:8000/api/dashboard/summary
```

### 16. Create Alert
```powershell
curl -X POST http://localhost:8000/api/alerts `
  -H "Content-Type: application/json" `
  -d '{
    "zone_id": "zone1",
    "alert_type": "MOTION",
    "severity": "HIGH",
    "details": "Intrusion detected"
  }'
```

### 17. Get All Alerts
```powershell
curl http://localhost:8000/api/alerts
```

## Pretty Print JSON (Optional)

Add `| ConvertFrom-Json | ConvertTo-Json` to PowerShell commands:

```powershell
curl http://localhost:8000/api/sensors | ConvertFrom-Json | ConvertTo-Json
```

## Using Invoke-WebRequest (PowerShell Alternative)

```powershell
# Get sensors
Invoke-WebRequest -Uri "http://localhost:8000/api/sensors" | ConvertTo-Json

# Post sensor data
$body = @{
    ultrasonic = 150
    temperature = 28.5
    humidity = 65
    signal = 90
    zone_id = "zone1"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/sensors/bulk" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

## Postman Import

You can import all these endpoints into Postman:

1. Open Postman
2. Click "Import"
3. Use the URL: `http://localhost:8000/openapi.json`
4. Click "Import" button
5. All endpoints will be auto-populated

Alternatively, visit: **http://localhost:8000/docs** for the interactive Swagger UI

## Test Scenarios

### Scenario 1: Send Sensor Update
```powershell
# Simulate ESP8266 sending data every 5 seconds
for ($i = 1; $i -le 5; $i++) {
    $temp = 25 + (Get-Random -Minimum 0 -Maximum 10)
    $humid = 50 + (Get-Random -Minimum 0 -Maximum 30)
    
    curl -X POST http://localhost:8000/api/sensors/bulk `
      -H "Content-Type: application/json" `
      -d "{
        \`"ultrasonic\`": 150,
        \`"temperature\`": $temp,
        \`"humidity\`": $humid,
        \`"signal\`": 90,
        \`"zone_id\`": \`"zone1\`"
      }"
    
    Start-Sleep -Seconds 1
}
```

### Scenario 2: Trigger Alert Sequence
```powershell
# Report intruder
$intruderId = "test_$(Get-Date -Format 'yyyyMMddHHmmss')"

curl -X POST http://localhost:8000/api/intruders `
  -H "Content-Type: application/json" `
  -d "{
    \`"id\`": \`"$intruderId\`",
    \`"zone_id\`": \`"zone1\`",
    \`"timestamp\`": \`"$(Get-Date -Format 'o')\`",
    \`"confidence\`": 0.95,
    \`"details\`": \`"Motion detected\`"
  }"

# Enable alerts
curl -X POST http://localhost:8000/api/devices/control `
  -H "Content-Type: application/json" `
  -d '{"led_status": true, "buzzer_status": true, "servo_status": false}'

# Check dashboard
Start-Sleep -Seconds 2
curl http://localhost:8000/api/dashboard | ConvertFrom-Json | ConvertTo-Json
```

## Troubleshooting cURL Commands

### Command Too Long
Break it into multiple lines with backtick (\`):
```powershell
curl -X POST http://localhost:8000/api/sensors/bulk `
  -H "Content-Type: application/json" `
  -d '{"ultrasonic": 150}'
```

### JSON Formatting Issues
Escape quotes in PowerShell:
```powershell
# Wrong
curl -X POST http://localhost:8000/api/sensors -d '{"key": "value"}'

# Correct
curl -X POST http://localhost:8000/api/sensors -d '{\"key\": \"value\"}'
```

### Check If Backend is Running
```powershell
curl http://localhost:8000/api/health
```

## Using with Python Requests

If you prefer Python:
```python
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Get sensors
response = requests.get(f"{BASE_URL}/sensors")
print(json.dumps(response.json(), indent=2))

# Send sensor data
sensor_data = {
    "ultrasonic": 150,
    "temperature": 28.5,
    "humidity": 65,
    "signal": 90
}
response = requests.post(f"{BASE_URL}/sensors/bulk", json=sensor_data)
print(response.json())
```

## Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Notes

- Replace `localhost` with your IP if accessing from another machine
- Replace `8000` if you changed the port in `.env`
- Add `| ConvertFrom-Json` in PowerShell to format JSON output
- Use Swagger UI for interactive testing
- Use Python test_backend.py for comprehensive testing
