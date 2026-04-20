# Backend-Frontend Data Flow Integration

## Overview
The backend is now fully connected with the frontend and serves real collected sensor data from the JSON file.

## Data Flow Architecture

```
┌─────────────────────────┐
│ sensor_data_collected.json   │  (Real collected sensor readings)
│  - 3 Zones              │
│  - 26 Readings          │
│  - 3 Intruders          │
└──────────────┬──────────┘
               │ (Loaded on startup)
               ▼
       ┌─────────────────┐
       │  BACKEND        │
       │  (FastAPI)      │
       │                 │
       │ Endpoints:      │
       │ /api/sensors    │
       │ /api/zones      │
       │ /api/intruders  │
       │ /api/dashboard  │
       │ /api/collected- │
       │    data/*       │
       └────────┬────────┘
                │ (HTTP/JSON)
                ▼
        ┌────────────────┐
        │  FRONTEND      │
        │  (React/Vite)  │
        │                │
        │ Components:    │
        │ Dashboard      │
        │ Sensor Monitor │
        │ Zone Viewer    │
        │ Intruder Alerts│
        │ Collected Data │
        │ Viewer         │
        └────────────────┘
```

## Backend Connection Details

### Data Loading (On Startup)
1. Backend reads `sensor_data_collected.json`
2. Initializes in-memory database with:
   - Latest sensor readings from zone data
   - Zone statuses (ALERT if any reading is ALERT)
   - 3 intruder detections with threat levels
   - Historical data for analytics

### Key Endpoints Serving Collected Data

| Endpoint | Data Source | Description |
|----------|-------------|-------------|
| `/api/sensors` | Latest reading from first zone | Current sensor values |
| `/api/zones` | Zone data from JSON | All monitoring zones status |
| `/api/intruders` | Intruder detections from JSON | Active intruder alerts |
| `/api/dashboard` | All collected data | Complete dashboard overview |
| `/api/collected-data` | Full JSON file | Raw collected data |
| `/api/collected-data/zones` | Zone array | Detailed zone readings |
| `/api/collected-data/zones/{id}` | Specific zone | Zone-specific data |
| `/api/collected-data/intruders` | Intruder array | Intruder detections |
| `/api/collected-data/summary` | Summary stats | Statistics overview |

## Frontend Integration

### Components Displaying Collected Data

1. **Dashboard.jsx** - Main dashboard view
   - Shows real-time sensor data from backend
   - Displays zone statuses
   - Shows intruder alerts
   - Includes device controls

2. **SensorMonitoring.jsx** - Live sensor readings
   - Proximity (Ultrasonic)
   - Temperature
   - Humidity
   - Signal Strength

3. **IntruderAlerts.jsx** - Intruder detection display
   - Shows all detected intruders
   - Threat levels
   - Timestamp and location

4. **CollectedDataViewer.jsx** - Historical data analysis
   - Zone-wise readings table
   - Intruder detection history
   - Summary statistics
   - Collection metadata

### API Service Integration

All API calls go through `frontend/src/services/api.js`:

```javascript
// Fetch current sensors
const sensorData = await api.getSensors();

// Fetch zone data
const zones = await api.getZones();

// Fetch intruders
const intruders = await api.getIntruders();

// Fetch collected data
const collected = await api.getCollectedData();
```

## Running the System

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Startup Output:**
```
✓ WSN Backend started successfully
✓ Listening on port 8000
✓ API Documentation: http://localhost:8000/docs

📊 Loaded Collected Data:
   ✓ 3 monitoring zones
   ✓ 26 sensor readings
   ✓ 3 intruder detections
   ✓ Collection Date: 2026-04-20

🔗 Frontend Connection: http://localhost:5173
📡 Data Flow: JSON File → Backend → Frontend
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Data Verification

### Backend Endpoints
Test endpoints in browser or Postman:

- http://localhost:8000/api/sensors
- http://localhost:8000/api/zones
- http://localhost:8000/api/intruders
- http://localhost:8000/api/dashboard
- http://localhost:8000/docs (API Documentation)

### Frontend Display
Visit: http://localhost:5173

Expected to see:
- ✓ Real sensor readings (from JSON)
- ✓ Zone statuses (North Boundary, East Gate, West Storage)
- ✓ Intruder detection history
- ✓ Collected data viewer with detailed readings
- ✓ Alert events highlighted
- ✓ Device control panel

## Data Sources Summary

| Component | Data From | Update Frequency |
|-----------|-----------|------------------|
| Current Sensors | Latest JSON reading | On backend start |
| Zone Status | JSON zone data | On backend start |
| Intruder Alerts | JSON intruder array | On backend start |
| Historical Data | Full JSON file | On demand (API call) |
| Device Status | Backend in-memory | On device control |

## Features Working

✓ Backend loads collected data from JSON on startup  
✓ All sensor readings available via API  
✓ Zone status reflects alert history from data  
✓ Intruder detections loaded with full details  
✓ Frontend displays all data from backend  
✓ Real-time monitoring interface working  
✓ Collected data viewer showing historical analytics  
✓ Complete integration pipeline functional  

## Next Steps (Optional)

1. **Database Integration**: Replace in-memory storage with database
2. **Real Sensors**: Connect actual ESP8266 sensors
3. **MQTT Support**: Add real-time MQTT broker integration
4. **Data Persistence**: Save new readings to database
5. **Alerts System**: Implement real email/SMS notifications
