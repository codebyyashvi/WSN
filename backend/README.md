# WSN Backend - Farm Security System

Wireless Sensor Network backend for a farm security system with motion detection, zone management, and device control.

## Features

- **Real-time Sensor Data** - Ultrasonic distance, temperature, humidity, and signal strength
- **5-Zone Security Management** - Monitor different farm areas
- **Device Control** - LED, Buzzer, and Servo motor control
- **Intruder Detection** - Automatic alert system when motion detected
- **ESP8266 Integration** - Receive data from Arduino-based devices
- **Dashboard API** - Single endpoint for all dashboard data

## Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints

### Sensor Data

#### Get Current Sensor Readings
```
GET /api/sensors
```

Response:
```json
{
  "success": true,
  "data": {
    "ultrasonic": 150,
    "temperature": 28,
    "humidity": 65,
    "signal": 95,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Post Sensor Data (from ESP8266)
```
POST /api/sensors
Content-Type: application/json

{
  "ultrasonic": 45,
  "temperature": 27.5,
  "humidity": 60,
  "signal": 92
}
```

### Zone Management

#### Get All Zones
```
GET /api/zones
```

#### Get Specific Zone
```
GET /api/zones/zone1
```

#### Update Zone Status
```
PUT /api/zones/zone1
Content-Type: application/json

{
  "status": "INTRUDER DETECTED"
}
```

Valid statuses: `OK`, `INTRUDER DETECTED`, `ALARM`

#### Reset Zone
```
DELETE /api/zones/zone1/reset
```

### Device Control

#### Get All Devices
```
GET /api/devices
```

Response:
```json
{
  "success": true,
  "data": {
    "led_status": false,
    "buzzer_status": false,
    "servo_status": false,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Control Device
```
POST /api/devices/led/control
Content-Type: application/json

{
  "action": "on"
}
```

Actions: `on`, `off`, `toggle`

Devices: `led`, `buzzer`, `servo`

#### Activate All Alert Devices
```
POST /api/devices/activate-alert
```

#### Deactivate All Alert Devices
```
POST /api/devices/deactivate-alert
```

### Intruder Detection

#### Get All Intruder Alerts
```
GET /api/intruders
```

Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid-1234",
      "zone": "zone1",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "severity": "CRITICAL",
      "distance": 35
    }
  ]
}
```

#### Report Intruder Detection (from ESP8266)
```
POST /api/intruder-detection
Content-Type: application/json

{
  "zone": "zone1",
  "distance": 30,
  "severity": "CRITICAL"
}
```

#### Clear All Alerts
```
DELETE /api/intruders
```

#### Clear Single Alert
```
DELETE /api/intruders/{intruderId}
```

### System Endpoints

#### Health Check
```
GET /api/health
```

#### Get All Dashboard Data
```
GET /api/dashboard-data
```

Returns sensors, zones, devices, intruders, and system status in one request.

#### Emergency System Reset
```
POST /api/system/reset
```

## ESP8266 Arduino Code Integration

### Posting Sensor Data

```cpp
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

const char* serverUrl = "http://192.168.X.X:5000/api/sensors";

void postSensorData(int ultrasonic, float temp, int humidity) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["ultrasonic"] = ultrasonic;
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["signal"] = WiFi.RSSI(); // Signal strength in dBm
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    http.end();
  }
}
```

### Reporting Intruder Detection

```cpp
void reportIntruderDetection(int distance) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://192.168.X.X:5000/api/intruder-detection");
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["distance"] = distance;
    doc["severity"] = "CRITICAL";
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    http.end();
  }
}
```

### Controlling Devices

```cpp
void controlDevice(String deviceName, String action) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://192.168.X.X:5000/api/devices/" + 
                 deviceName + "/control";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<100> doc;
    doc["action"] = action; // "on", "off", or "toggle"
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    http.end();
  }
}
```

## Data Flow

```
ESP8266 (Sensors)
  ↓
  ├─→ POST /api/sensors (ultrasonic, temp, humidity)
  └─→ POST /api/intruder-detection (when motion detected)

Backend
  ├─→ Process sensor data
  ├─→ Check for intruders (ultrasonic < 50cm)
  ├─→ Update zones
  └─→ Activate/deactivate devices

Frontend (React)
  ↓
  GET /api/dashboard-data (every 3 seconds)
  ├─→ Display sensor readings
  ├─→ Show zone statuses
  ├─→ Show device statuses
  └─→ Display intruder alerts
```

## Configuration

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Error Handling

All endpoints return consistent JSON responses:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Description of error"
}
```

## Security Notes

- Implement authentication/authorization for production
- Validate all incoming data
- Use HTTPS for production endpoints
- Implement rate limiting for ESP8266 requests
- Use environment variables for sensitive data

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] WebSocket for real-time updates
- [ ] User authentication
- [ ] Email/SMS alerts
- [ ] Data logging and analytics
- [ ] Historical data reports
- [ ] API rate limiting
- [ ] Webhook integration
