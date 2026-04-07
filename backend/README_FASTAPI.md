# WSN Backend - Python FastAPI

Complete wireless sensor network backend built with FastAPI for your farm security system.

## Features

- **Sensor Management**: Ultrasonic, temperature, humidity, and signal strength readings
- **Device Control**: LED, buzzer, and servo control endpoints
- **Zone Security**: 5 configurable security zones with status tracking
- **Intruder Detection**: Real-time intruder detection and alerting
- **Dashboard API**: Complete dashboard data endpoints
- **ESP8266 Integration**: Ready to receive data from Arduino/ESP8266
- **CORS Enabled**: Full cross-origin resource sharing for frontend
- **Auto Documentation**: Swagger UI and ReDoc documentation

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure environment** (optional):
```bash
# Edit .env file
FRONTEND_URL=http://localhost:5173
PORT=8000
```

## Running the Server

### Development Mode
```bash
python main.py
```

### Production Mode with Uvicorn
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## API Documentation

Once running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Sensors
- `GET /api/sensors` - Get current sensor readings
- `POST /api/sensors` - Update sensor readings (from ESP8266)
- `POST /api/sensors/bulk` - Bulk update all sensors

### Devices
- `GET /api/devices` - Get device status
- `POST /api/devices/led` - Control LED
- `POST /api/devices/buzzer` - Control buzzer
- `POST /api/devices/servo` - Control servo
- `POST /api/devices/control` - Control multiple devices

### Zones
- `GET /api/zones` - Get all zones
- `GET /api/zones/{zone_id}` - Get specific zone
- `PUT /api/zones/{zone_id}` - Update zone status

### Intruders
- `GET /api/intruders` - Get all detected intruders
- `POST /api/intruders` - Report intruder (from ESP8266)
- `DELETE /api/intruders/{intruder_id}` - Clear specific intruder
- `DELETE /api/intruders` - Clear all intruders

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert (from ESP8266)
- `DELETE /api/alerts/{alert_id}` - Clear alert

### Dashboard
- `GET /api/dashboard` - Get complete dashboard data
- `GET /api/dashboard/summary` - Get dashboard summary

### System
- `GET /api/health` - Health check
- `GET /` - Root endpoint

## ESP8266 Arduino Code Integration

The backend is ready to receive data from your ESP8266. Send data to:

### Send Sensor Data
```
POST http://your-backend-ip:8000/api/sensors/bulk
Content-Type: application/json

{
  "ultrasonic": 150,
  "temperature": 28.5,
  "humidity": 65,
  "signal": 90,
  "zone_id": "zone1"
}
```

### Report Intruder
```
POST http://your-backend-ip:8000/api/intruders
Content-Type: application/json

{
  "id": "intruder_001",
  "zone_id": "zone1",
  "timestamp": "2026-04-07T10:30:00",
  "confidence": 0.95,
  "details": "Motion detected"
}
```

### Create Alert
```
POST http://your-backend-ip:8000/api/alerts
Content-Type: application/json

{
  "zone_id": "zone1",
  "alert_type": "MOTION",
  "severity": "HIGH",
  "details": "Intruder detected in Zone 1"
}
```

## Data Models

### SensorUpdate
```json
{
  "ultrasonic": 150.0,
  "temperature": 28.5,
  "humidity": 65.0,
  "signal": 90
}
```

### DeviceControl
```json
{
  "led_status": true,
  "buzzer_status": false,
  "servo_status": false
}
```

### Intruder
```json
{
  "id": "intruder_001",
  "zone_id": "zone1",
  "timestamp": "2026-04-07T10:30:00",
  "confidence": 0.95,
  "details": "Motion detected"
}
```

### Alert
```json
{
  "zone_id": "zone1",
  "alert_type": "MOTION",
  "severity": "HIGH",
  "timestamp": "2026-04-07T10:30:00",
  "details": "Intruder detected"
}
```

## Frontend Integration

The frontend can communicate with the backend using:

```javascript
const API_BASE = 'http://localhost:8000/api';

// Get sensors
fetch(`${API_BASE}/sensors`)
  .then(r => r.json())

// Update devices
fetch(`${API_BASE}/devices/control`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    led_status: true,
    buzzer_status: false,
    servo_status: false
  })
})

// Get dashboard
fetch(`${API_BASE}/dashboard`)
  .then(r => r.json())
```

## Port Configuration

- Backend API: `8000`
- Frontend: `5173` (Vite default)

Update `FRONTEND_URL` in `.env` if running on different port.

## Troubleshooting

1. **CORS Errors**: Ensure `FRONTEND_URL` in `.env` matches your frontend URL
2. **Port Already in Use**: Change `PORT` in `.env` or kill process using port 8000
3. **Import Errors**: Ensure all dependencies are installed: `pip install -r requirements.txt`

## License

Wireless Sensor Network Backend - Farm Security System
