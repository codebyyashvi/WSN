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

sensors_db = {
    "ultrasonic": 150,
    "temperature": 28,
    "humidity": 65,
    "signal": 95,
    "timestamp": datetime.now(),
    "zone_id": None
}

zones_db = {
    "zone1": {"status": "OK", "lastAlert": None, "name": "North Gate"},
    "zone2": {"status": "OK", "lastAlert": None, "name": "East Fence"},
    "zone3": {"status": "OK", "lastAlert": None, "name": "Main Area"},
    "zone4": {"status": "OK", "lastAlert": None, "name": "West Perimeter"},
    "zone5": {"status": "OK", "lastAlert": None, "name": "South Sector"}
}

devices_db = {
    "led_status": False,
    "buzzer_status": False,
    "servo_status": False,
    "lastUpdated": datetime.now()
}

intruders_db: List[Dict] = []
alerts_db: List[Dict] = []

# ============= SENSOR ENDPOINTS =============

@app.get("/api/sensors", tags=["Sensors"])
async def get_sensors():
    """
    GET /api/sensors
    Retrieve current sensor readings
    """
    return {
        "ultrasonic": sensors_db["ultrasonic"],
        "temperature": sensors_db["temperature"],
        "humidity": sensors_db["humidity"],
        "signal": sensors_db["signal"],
        "timestamp": sensors_db["timestamp"].isoformat(),
        "zone_id": sensors_db["zone_id"]
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
    Get all security zones
    """
    return {
        "zones": zones_db,
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
    Get all detected intruders
    """
    return {
        "count": len(intruders_db),
        "intruders": intruders_db,
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
    Get complete dashboard data
    """
    return {
        "sensors": {
            "ultrasonic": sensors_db["ultrasonic"],
            "temperature": sensors_db["temperature"],
            "humidity": sensors_db["humidity"],
            "signal": sensors_db["signal"],
            "timestamp": sensors_db["timestamp"].isoformat()
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
            "total": len(intruders_db)
        },
        "alerts": {
            "count": len(alerts_db),
            "total": len(alerts_db)
        },
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
