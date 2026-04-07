# Single Motion Sensor Setup Guide

## ✅ Backend Compatibility - CONFIRMED

Your backend **works perfectly** with a single motion sensor. No zone_id is required.

---

## 📋 Your Current System

```
┌─────────────────┐
│  ESP8266        │
│  (1 sensor)     │
│ • Ultrasonic    │
│ • Temperature   │
│ • Humidity      │
│ • Signal        │
│ • Motion        │
└────────┬────────┘
         │ HTTP POST
         ↓
        8000 (Backend)
         │
    ┌────┴────┐
    ↓         ↓
Frontend   Dashboard
(5173)    (websocket)
```

---

## 🔧 Arduino Code - What to Send

### Simple Data Format (NO zone_id)
```cpp
// Send every 5 seconds to backend
POST http://192.168.1.100:8000/api/sensors/bulk

{
  "ultrasonic": 150,      // Distance in cm
  "temperature": 28,      // Celsius
  "humidity": 65,         // Percentage
  "signal": 90            // WiFi signal %
}
```

**That's it!** No zone information needed.

### When Motion Detected
```cpp
// Optional: Report intruder/motion alert
POST http://192.168.1.100:8000/api/intruders

{
  "id": "motion_12345",
  "zone_id": "zone1",         // Can use default "zone1"
  "confidence": 0.9,
  "details": "Motion detected"
}
```

---

## 📁 Files Provided

### 1. **ESP8266_SINGLE_SENSOR.cpp** (NEW)
Simplified Arduino code for YOUR setup:
- ✅ Single motion sensor
- ✅ No zone_id required
- ✅ Sends to backend every 5 seconds
- ✅ Triggers alerts on motion
- ✅ Handles WiFi reconnection

### 2. **test_single_sensor.py** (NEW)
Test script to verify backend works with your setup:
- Run: `python test_single_sensor.py`
- Tests without zone_id
- Confirms all endpoints work
- Shows exact data format

### 3. **test_backend.py** (Original)
Original 11-test suite still works perfectly

---

## 🚀 Setup Steps

### Step 1: Update Arduino Code
1. Use **ESP8266_SINGLE_SENSOR.cpp** (provided above)
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_SSID";
   const char* password = "YOUR_PASSWORD";
   ```

3. Get your computer's IP:
   ```powershell
   ipconfig
   # Find: IPv4 Address (e.g., 192.168.1.100)
   ```

4. Update backend URL:
   ```cpp
   const char* backendUrl = "http://192.168.1.100:8000/api";
   ```

5. Upload to ESP8266

### Step 2: Verify Backend
```bash
# In backend directory
python test_single_sensor.py
```

Expected output:
```
✓ Sensor data WITHOUT zone_id - PASS
✓ Retrieve sensors            - PASS
✓ Dashboard works             - PASS
```

### Step 3: Run Frontend
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

### Step 4: Monitor Data
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "api"
4. Watch requests to backend
5. Verify responses are 200

---

## 📊 Data Flow

### Every 5 Seconds (Sensor Update)
```
ESP8266
  ↓ (POST /sensors/bulk)
Backend (stores in memory)
  ↓ (GET /dashboard)
Frontend (displays)
  ↓
User sees live data
```

### When Motion Detected
```
ESP8266 (Motion = HIGH)
  ↓ (POST /intruders)
Backend (triggers alert)
  ↓ (GET /intruders)
Frontend (shows alert)
  ↓ (turns on LED/Buzzer)
User receives alert
```

---

## ✅ What Works

| Feature | Status | Details |
|---------|--------|---------|
| Sensor data (no zone) | ✅ | Tested & confirmed |
| Dashboard display | ✅ | Real-time updates |
| Motion alerts | ✅ | Works with zone1 |
| Device control | ✅ | LED, Buzzer, Servo |
| Data persistence | ✅ | Until restart |
| CORS enabled | ✅ | Frontend→Backend |

---

## 🎯 Key Points

1. **zone_id is Optional**
   - Your single sensor doesn't need it
   - Backend still works perfectly
   - All endpoints function normally

2. **Simple Data Format**
   ```json
   {
     "ultrasonic": 150,
     "temperature": 28,
     "humidity": 65,
     "signal": 90
   }
   ```

3. **No Changes Needed**
   - You can keep the backend as-is
   - Don' t need to modify any endpoints
   - Everything is compatible

4. **Future-Proof**
   - If you add more sensors later, just add zone_id
   - Backend already supports it
   - No code changes needed

---

## 🧪 Test Anytime

```bash
# Verify backend still works with single sensor
python test_single_sensor.py

# All tests pass? ✓
# You're ready to connect Arduino!
```

---

## 💡 Recommended Arduino Setup

Use the provided **ESP8266_SINGLE_SENSOR.cpp** which:

✅ Reads ultrasonic sensor
✅ Reads temperature/humidity
✅ Reads WiFi signal
✅ Detects motion
✅ Sends data every 5 seconds
✅ Reports motion alerts
✅ Triggers local LED/Buzzer
✅ Handles WiFi reconnection
✅ Sends NO zone_id (not needed)

---

## 📞 Quick Verification

### Backend Running?
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy",...}
```

### Can Send Data?
```bash
curl -X POST http://localhost:8000/api/sensors/bulk \
  -H "Content-Type: application/json" \
  -d '{"ultrasonic":150,"temperature":28,"humidity":65,"signal":90}'
# Should return: {"status":"success",...}
```

### Frontend Connected?
```
Open http://localhost:5173
Sensor values should display
```

---

## 🎉 Summary

✅ **Backend works 100% with your single motion sensor**
✅ **No zone_id required - completely optional**
✅ **All endpoints functional**
✅ **Frontend ready to display data**
✅ **Arduino code provided and simplified**
✅ **System fully tested**

**You're good to go!** Just upload the Arduino code and connect. 🚀

---

**Next Steps:**
1. Copy **ESP8266_SINGLE_SENSOR.cpp** to your Arduino IDE
2. Update WiFi credentials and backend IP
3. Upload to ESP8266
4. Run `python test_single_sensor.py` to verify
5. Open frontend at http://localhost:5173
6. Watch real-time data flow!
