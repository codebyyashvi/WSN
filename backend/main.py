from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="WSN Backend", description="Wireless Sensor Network Backend for Farm Security")

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= DATA MODELS =============

class ZoneStatus(str, Enum):
    OK = "OK"
    ALERT = "ALERT"
    WARNING = "WARNING"

class SensorData(BaseModel):
    ultrasonic: float
    temperature: float
    humidity: float
    signal: int
    zone_id: Optional[str] = None

class SensorUpdate(BaseModel):
    ultrasonic: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    signal: Optional[int] = None

class DeviceControl(BaseModel):
    led_status: Optional[bool] = None
    buzzer_status: Optional[bool] = None
    servo_status: Optional[bool] = None

class ZoneData(BaseModel):
    zone_id: str
    status: ZoneStatus
    name: str
    lastAlert: Optional[str] = None

class Intruder(BaseModel):
    id: str
    zone_id: str
    timestamp: str
    confidence: float
    details: Optional[str] = None

class AlertData(BaseModel):
    zone_id: str
    alert_type: str
    severity: str
    timestamp: Optional[str] = None
    details: Optional[str] = None

# ============= IN-MEMORY DATABASE =============

# Load collected data from JSON file
def load_collected_data():
    """Load collected sensor data from JSON file"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), "sensor_data_collected.json")
        with open(json_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

# Initialize with collected data
collected_data = load_collected_data()

# Initialize sensors_db from latest collected reading
def init_sensors_from_collected():
    if collected_data and collected_data.get('zones'):
        # Get the latest reading from the first zone
        latest_zone = collected_data['zones'][0]
        latest_readings = latest_zone.get('readings', [])
        if latest_readings:
            latest = latest_readings[-1]
            return {
                "ultrasonic": latest.get("ultrasonic", 150),
                "temperature": latest.get("temperature", 28),
                "humidity": latest.get("humidity", 65),
                "signal": latest.get("signal", 95),
                "timestamp": datetime.now(),
                "zone_id": latest_zone.get("zone_id", "zone1")
            }
    return {
        "ultrasonic": 150,
        "temperature": 28,
        "humidity": 65,
        "signal": 95,
        "timestamp": datetime.now(),
        "zone_id": None
    }

sensors_db = init_sensors_from_collected()

# Initialize zones from collected data
def init_zones_from_collected():
    zones = {
        "zone1": {"status": "OK", "lastAlert": None, "name": "North Boundary"},
        "zone2": {"status": "OK", "lastAlert": None, "name": "East Gate"},
        "zone3": {"status": "OK", "lastAlert": None, "name": "West Storage"},
        "zone4": {"status": "OK", "lastAlert": None, "name": "South Sector"},
        "zone5": {"status": "OK", "lastAlert": None, "name": "Central Area"}
    }
    
    if collected_data and collected_data.get('zones'):
        for zone in collected_data['zones']:
            zone_id = zone.get('zone_id')
            zone_name = zone.get('zone_name', 'Unknown')
            # Check if any reading in this zone is ALERT
            readings = zone.get('readings', [])
            has_alert = any(r.get('status') == 'ALERT' for r in readings)
            
            if zone_id and zone_id in zones:
                zones[zone_id]['name'] = zone_name
                zones[zone_id]['status'] = 'ALERT' if has_alert else 'OK'
    
    return zones

zones_db = init_zones_from_collected()

# Initialize intruders from collected data
def init_intruders_from_collected():
    intruders = []
    if collected_data and collected_data.get('intruder_detections'):
        for intruder in collected_data['intruder_detections']:
            intruders.append({
                "id": intruder.get("id"),
                "zone_id": intruder.get("zone_id"),
                "timestamp": intruder.get("timestamp"),
                "confidence": intruder.get("confidence", 0.9),
                "details": intruder.get("details"),
                "threat_level": intruder.get("threat_level", "HIGH"),
                "status": "active"
            })
    return intruders

intruders_db = init_intruders_from_collected()

devices_db = {
    "led_status": False,
    "buzzer_status": False,
    "servo_status": False,
    "lastUpdated": datetime.now()
}

alerts_db: List[Dict] = []

# ============= SENSOR ENDPOINTS =============

@app.get("/api/sensors", tags=["Sensors"])
async def get_sensors():
    """
    GET /api/sensors
    Retrieve current sensor readings from collected data
    """
    return {
        "ultrasonic": sensors_db["ultrasonic"],
        "temperature": sensors_db["temperature"],
        "humidity": sensors_db["humidity"],
        "signal": sensors_db["signal"],
        "timestamp": sensors_db["timestamp"].isoformat(),
        "zone_id": sensors_db["zone_id"],
        "data_source": "Collected sensor data from sensor_data_collected.json"
    }

@app.post("/api/sensors", tags=["Sensors"])
async def update_sensors(data: SensorUpdate):
    """
    POST /api/sensors
    Update sensor readings (from ESP8266)
    """
    if data.ultrasonic is not None:
        sensors_db["ultrasonic"] = data.ultrasonic
    if data.temperature is not None:
        sensors_db["temperature"] = data.temperature
    if data.humidity is not None:
        sensors_db["humidity"] = data.humidity
    if data.signal is not None:
        sensors_db["signal"] = data.signal
    
    sensors_db["timestamp"] = datetime.now()
    
    return {
        "status": "success",
        "message": "Sensors updated",
        "data": {
            "ultrasonic": sensors_db["ultrasonic"],
            "temperature": sensors_db["temperature"],
            "humidity": sensors_db["humidity"],
            "signal": sensors_db["signal"],
            "timestamp": sensors_db["timestamp"].isoformat()
        }
    }

@app.post("/api/sensors/bulk", tags=["Sensors"])
async def bulk_update_sensors(data: SensorData):
    """
    POST /api/sensors/bulk
    Bulk update all sensor data at once (from ESP8266)
    """
    sensors_db["ultrasonic"] = data.ultrasonic
    sensors_db["temperature"] = data.temperature
    sensors_db["humidity"] = data.humidity
    sensors_db["signal"] = data.signal
    sensors_db["timestamp"] = datetime.now()
    
    if data.zone_id:
        sensors_db["zone_id"] = data.zone_id
    
    return {
        "status": "success",
        "message": "All sensors updated",
        "data": {
            "ultrasonic": sensors_db["ultrasonic"],
            "temperature": sensors_db["temperature"],
            "humidity": sensors_db["humidity"],
            "signal": sensors_db["signal"],
            "timestamp": sensors_db["timestamp"].isoformat()
        }
    }

# ============= DEVICE CONTROL ENDPOINTS =============

@app.get("/api/devices", tags=["Devices"])
async def get_devices():
    """
    GET /api/devices
    Get current device status
    """
    return {
        "led_status": devices_db["led_status"],
        "buzzer_status": devices_db["buzzer_status"],
        "servo_status": devices_db["servo_status"],
        "lastUpdated": devices_db["lastUpdated"].isoformat()
    }

@app.post("/api/devices/led", tags=["Devices"])
async def control_led(control: DeviceControl):
    """
    POST /api/devices/led
    Control LED status
    """
    if control.led_status is not None:
        devices_db["led_status"] = control.led_status
        devices_db["lastUpdated"] = datetime.now()
    
    return {
        "status": "success",
        "message": f"LED turned {'ON' if devices_db['led_status'] else 'OFF'}",
        "led_status": devices_db["led_status"],
        "lastUpdated": devices_db["lastUpdated"].isoformat()
    }

@app.post("/api/devices/buzzer", tags=["Devices"])
async def control_buzzer(control: DeviceControl):
    """
    POST /api/devices/buzzer
    Control buzzer status
    """
    if control.buzzer_status is not None:
        devices_db["buzzer_status"] = control.buzzer_status
        devices_db["lastUpdated"] = datetime.now()
    
    return {
        "status": "success",
        "message": f"Buzzer turned {'ON' if devices_db['buzzer_status'] else 'OFF'}",
        "buzzer_status": devices_db["buzzer_status"],
        "lastUpdated": devices_db["lastUpdated"].isoformat()
    }

@app.post("/api/devices/servo", tags=["Devices"])
async def control_servo(control: DeviceControl):
    """
    POST /api/devices/servo
    Control servo status
    """
    if control.servo_status is not None:
        devices_db["servo_status"] = control.servo_status
        devices_db["lastUpdated"] = datetime.now()
    
    return {
        "status": "success",
        "message": f"Servo turned {'ON' if devices_db['servo_status'] else 'OFF'}",
        "servo_status": devices_db["servo_status"],
        "lastUpdated": devices_db["lastUpdated"].isoformat()
    }

@app.post("/api/devices/control", tags=["Devices"])
async def control_multiple_devices(control: DeviceControl):
    """
    POST /api/devices/control
    Control multiple devices at once
    """
    if control.led_status is not None:
        devices_db["led_status"] = control.led_status
    if control.buzzer_status is not None:
        devices_db["buzzer_status"] = control.buzzer_status
    if control.servo_status is not None:
        devices_db["servo_status"] = control.servo_status
    
    devices_db["lastUpdated"] = datetime.now()
    
    return {
        "status": "success",
        "message": "Devices updated",
        "devices": {
            "led_status": devices_db["led_status"],
            "buzzer_status": devices_db["buzzer_status"],
            "servo_status": devices_db["servo_status"]
        },
        "lastUpdated": devices_db["lastUpdated"].isoformat()
    }

# ============= ZONE ENDPOINTS =============

@app.get("/api/zones", tags=["Zones"])
async def get_zones():
    """
    GET /api/zones
    Get all security zones from collected data
    """
    return {
        "zones": zones_db,
        "data_source": "Zone status from sensor_data_collected.json",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/zones/{zone_id}", tags=["Zones"])
async def get_zone(zone_id: str):
    """
    GET /api/zones/{zone_id}
    Get specific zone status
    """
    if zone_id not in zones_db:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    
    return {
        "zone_id": zone_id,
        "data": zones_db[zone_id],
        "timestamp": datetime.now().isoformat()
    }

@app.put("/api/zones/{zone_id}", tags=["Zones"])
async def update_zone(zone_id: str, zone_data: ZoneData):
    """
    PUT /api/zones/{zone_id}
    Update zone status
    """
    if zone_id not in zones_db:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    
    zones_db[zone_id]["status"] = zone_data.status
    zones_db[zone_id]["name"] = zone_data.name
    zones_db[zone_id]["lastAlert"] = zone_data.lastAlert
    
    return {
        "status": "success",
        "message": f"Zone {zone_id} updated",
        "zone": zones_db[zone_id]
    }

# ============= INTRUDER DETECTION ENDPOINTS =============

@app.get("/api/intruders", tags=["Intruders"])
async def get_intruders():
    """
    GET /api/intruders
    Get all detected intruders from collected data
    """
    return {
        "count": len(intruders_db),
        "intruders": intruders_db,
        "data_source": "Real-time intruder detections from sensor_data_collected.json",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/intruders", tags=["Intruders"])
async def report_intruder(intruder: Intruder):
    """
    POST /api/intruders
    Report a detected intruder (from ESP8266)
    """
    intruder_record = {
        "id": intruder.id,
        "zone_id": intruder.zone_id,
        "timestamp": intruder.timestamp or datetime.now().isoformat(),
        "confidence": intruder.confidence,
        "details": intruder.details,
        "status": "active"
    }
    
    intruders_db.append(intruder_record)
    
    # Update zone status
    if intruder.zone_id in zones_db:
        zones_db[intruder.zone_id]["status"] = "ALERT"
        zones_db[intruder.zone_id]["lastAlert"] = intruder_record["timestamp"]
    
    return {
        "status": "success",
        "message": "Intruder reported",
        "intruder": intruder_record
    }

@app.delete("/api/intruders/{intruder_id}", tags=["Intruders"])
async def clear_intruder(intruder_id: str):
    """
    DELETE /api/intruders/{intruder_id}
    Clear/resolve intruder alert
    """
    global intruders_db
    intruders_db = [i for i in intruders_db if i["id"] != intruder_id]
    
    return {
        "status": "success",
        "message": f"Intruder {intruder_id} cleared"
    }

@app.delete("/api/intruders", tags=["Intruders"])
async def clear_all_intruders():
    """
    DELETE /api/intruders
    Clear all intruder alerts
    """
    global intruders_db
    count = len(intruders_db)
    intruders_db = []
    
    # Reset all zones to OK
    for zone in zones_db:
        zones_db[zone]["status"] = "OK"
    
    return {
        "status": "success",
        "message": f"Cleared {count} intruder alerts",
        "cleared_count": count
    }

# ============= ALERT ENDPOINTS =============

@app.get("/api/alerts", tags=["Alerts"])
async def get_alerts():
    """
    GET /api/alerts
    Get all system alerts
    """
    return {
        "count": len(alerts_db),
        "alerts": alerts_db,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/alerts", tags=["Alerts"])
async def create_alert(alert: AlertData):
    """
    POST /api/alerts
    Create a new system alert (from ESP8266)
    """
    alert_record = {
        "id": f"alert_{len(alerts_db) + 1}",
        "zone_id": alert.zone_id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "timestamp": alert.timestamp or datetime.now().isoformat(),
        "details": alert.details,
        "status": "active"
    }
    
    alerts_db.append(alert_record)
    
    return {
        "status": "success",
        "message": "Alert created",
        "alert": alert_record
    }

@app.delete("/api/alerts/{alert_id}", tags=["Alerts"])
async def clear_alert(alert_id: str):
    """
    DELETE /api/alerts/{alert_id}
    Clear a specific alert
    """
    global alerts_db
    alerts_db = [a for a in alerts_db if a["id"] != alert_id]
    
    return {
        "status": "success",
        "message": f"Alert {alert_id} cleared"
    }

# ============= DASHBOARD ENDPOINTS =============

@app.get("/api/dashboard", tags=["Dashboard"])
async def get_dashboard():
    """
    GET /api/dashboard
    Get complete dashboard data from collected sensor readings
    """
    return {
        "sensors": {
            "ultrasonic": sensors_db["ultrasonic"],
            "temperature": sensors_db["temperature"],
            "humidity": sensors_db["humidity"],
            "signal": sensors_db["signal"],
            "timestamp": sensors_db["timestamp"].isoformat(),
            "zone_id": sensors_db["zone_id"]
        },
        "devices": {
            "led_status": devices_db["led_status"],
            "buzzer_status": devices_db["buzzer_status"],
            "servo_status": devices_db["servo_status"],
            "lastUpdated": devices_db["lastUpdated"].isoformat()
        },
        "zones": zones_db,
        "intruders": {
            "count": len(intruders_db),
            "total": len(intruders_db),
            "items": intruders_db[:5]  # Latest 5
        },
        "alerts": {
            "count": len(alerts_db),
            "total": len(alerts_db)
        },
        "data_source": "Real-time collected sensor data (JSON)" if collected_data else "Mock data",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/dashboard/summary", tags=["Dashboard"])
async def get_dashboard_summary():
    """
    GET /api/dashboard/summary
    Get dashboard summary
    """
    alert_count = len(alerts_db)
    intruder_count = len(intruders_db)
    critical_zones = sum(1 for z in zones_db.values() if z["status"] != "OK")
    
    return {
        "farm_status": "ALERT" if alert_count > 0 or intruder_count > 0 else "SECURE",
        "critical_alerts": alert_count,
        "intruders_detected": intruder_count,
        "zones_at_risk": critical_zones,
        "active_devices": sum([devices_db["led_status"], devices_db["buzzer_status"], devices_db["servo_status"]]),
        "timestamp": datetime.now().isoformat()
    }

# ============= COLLECTED DATA ENDPOINTS =============

def load_collected_data():
    """Load collected sensor data from JSON file"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), "sensor_data_collected.json")
        with open(json_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Collected data file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format"}

@app.get("/api/collected-data", tags=["Collected Data"])
async def get_collected_data():
    """
    GET /api/collected-data
    Get all collected sensor data from real-time readings
    """
    data = load_collected_data()
    return {
        "status": "success",
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/collected-data/zones", tags=["Collected Data"])
async def get_collected_zones():
    """
    GET /api/collected-data/zones
    Get collected data by zones
    """
    data = load_collected_data()
    zones = data.get("zones", [])
    return {
        "status": "success",
        "zones": zones,
        "total_zones": len(zones),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/collected-data/zones/{zone_id}", tags=["Collected Data"])
async def get_zone_collected_data(zone_id: str):
    """
    GET /api/collected-data/zones/{zone_id}
    Get collected data for specific zone
    """
    data = load_collected_data()
    zones = data.get("zones", [])
    zone_data = next((z for z in zones if z["zone_id"] == zone_id), None)
    
    if not zone_data:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found in collected data")
    
    return {
        "status": "success",
        "zone": zone_data,
        "total_readings": len(zone_data.get("readings", [])),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/collected-data/intruders", tags=["Collected Data"])
async def get_collected_intruders():
    """
    GET /api/collected-data/intruders
    Get all collected intruder detections
    """
    data = load_collected_data()
    intruders = data.get("intruder_detections", [])
    return {
        "status": "success",
        "intruders": intruders,
        "total_detections": len(intruders),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/collected-data/summary", tags=["Collected Data"])
async def get_collected_summary():
    """
    GET /api/collected-data/summary
    Get summary statistics of collected data
    """
    data = load_collected_data()
    return {
        "status": "success",
        "summary": data.get("summary_statistics", {}),
        "metadata": data.get("metadata", {}),
        "timestamp": datetime.now().isoformat()
    }

# ============= HEALTH CHECK & STATUS =============

@app.get("/api/health", tags=["System"])
async def health_check():
    """
    GET /api/health
    System health check
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
async def root():
    """
    GET /
    Root endpoint
    """
    return {
        "message": "WSN Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# ============= STARTUP EVENT =============

@app.on_event("startup")
async def startup_event():
    print("✓ WSN Backend started successfully")
    print(f"✓ Listening on port 8000")
    print(f"✓ API Documentation: http://localhost:8000/docs")
    
    # Load and display collected data info
    if collected_data:
        zones_count = len(collected_data.get('zones', []))
        total_readings = collected_data.get('summary_statistics', {}).get('total_readings', 0)
        intruders_count = len(collected_data.get('intruder_detections', []))
        print(f"\n📊 Loaded Collected Data:")
        print(f"   ✓ {zones_count} monitoring zones")
        print(f"   ✓ {total_readings} sensor readings")
        print(f"   ✓ {intruders_count} intruder detections")
        print(f"   ✓ Collection Date: {collected_data.get('metadata', {}).get('collection_date', 'N/A')}")
        print(f"\n🔗 Frontend Connection: http://localhost:5173")
        print(f"📡 Data Flow: JSON File → Backend → Frontend")
    else:
        print("⚠ No collected data file found - using default mock data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
