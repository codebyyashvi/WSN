# Frontend-Backend Integration Guide

Your WSN system is now fully integrated! Here's how to run everything:

## 🚀 Backend Status
✅ **FastAPI Backend is Running**
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Port**: 8000
- **Status**: Listening for requests

## 🎨 Frontend Integration

### 1. Start the Frontend
```bash
cd frontend
npm install  # If not already done
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 2. Environment Configuration ✅
The `.env.local` file is already configured:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. API Service ✅
Created: `frontend/src/services/api.js`
- All API functions available
- Automatic error handling
- Proper CORS configuration

## 📊 Dashboard Integration ✅

Updated Components:
- **Dashboard.jsx** - Fetches real data from backend
  - Polls backend every 3 seconds
  - Shows loading state
  - Error handling
  
- **DeviceControl.jsx** - Full control implementation
  - Click to toggle LED, buzzer, servo
  - Real-time API calls
  - Status updates

## 🔌 API Endpoints Connected

### Sensors
- `GET /api/sensors` - ✅ Real sensor readings
- `POST /api/sensors/bulk` - ✅ Update from ESP8266

### Devices
- `GET /api/devices` - ✅ Device status
- `POST /api/devices/led` - ✅ Toggle LED
- `POST /api/devices/buzzer` - ✅ Toggle buzzer
- `POST /api/devices/servo` - ✅ Toggle servo

### Intruders & Zones
- `GET /api/intruders` - ✅ Get intruders
- `POST /api/intruders` - ✅ Report from ESP8266
- `DELETE /api/intruders` - ✅ Clear alerts
- `GET /api/zones` - ✅ Zone status

### Dashboard
- `GET /api/dashboard` - ✅ Complete dashboard data
- `GET /api/dashboard/summary` - ✅ Quick summary

## 🖥️ Running Both Simultaneously

### Terminal 1 - Backend
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3 (Optional) - ESP8266 Monitor
Monitor serial output from your microcontroller to see data being sent.

## 🧪 Testing the Integration

### 1. Test Backend
Visit: http://localhost:8000/docs

Try endpoints:
- Get sensors: `GET /api/sensors`
- Get devices: `GET /api/devices`
- Get dashboard: `GET /api/dashboard`

### 2. Test Frontend
Visit: http://localhost:5173

Check:
- Dashboard loads without errors
- Sensor values display
- Device controls are clickable
- Clicking devices toggles them

### 3. Monitor in DevTools
Open browser DevTools (F12) → Network tab
- Should see requests to `http://localhost:8000/api`
- Response status should be 200

## 📱 ESP8266 Integration

Your Arduino code should send data to:
```
http://192.168.X.X:8000/api/sensors/bulk
```

Replace `192.168.X.X` with your computer's IP address on the local network.

**To find your IP**:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

Then update ESP8266 code:
```cpp
const char* backendUrl = "http://192.168.1.100:8000";
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Error: Address already in use
# Kill the process:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend can't connect to backend
1. Check backend is running: `http://localhost:8000/docs`
2. Check `.env.local` has correct URL
3. Check CORS settings in `main.py`
4. Restart frontend: `npm run dev`

### Devices don't toggle
1. Check browser console for errors (F12)
2. Check backend logs for API errors
3. Check network requests in DevTools
4. Verify API endpoint response in Swagger UI

### Missing packages
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

## 📊 Data Flow

```
ESP8266 → Backend (FastAPI)
              ↓
          Database/Memory
              ↓
Frontend (React) ← API Requests
    ↓
Browser Display
    ↓
User Controls Devices
    ↓
Frontend → Backend → ESP8266
```

## 🔐 CORS Configuration

Backend CORS allows:
- http://localhost:5173 (Frontend)
- http://localhost:3000 (Alternative)
- Configured in `main.py` via `.env`

To add more origins, update:
```python
# In main.py line 13-18
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://your-domain.com"
]
```

## 📈 Next Steps

1. ✅ Backend running
2. ✅ Frontend connected
3. Run frontend: `npm run dev`
4. Update ESP8266 with backend IP
5. Upload Arduino code to microcontroller
6. Watch real-time data flow!

## 🎯 Quick Command Reference

```bash
# Terminal 1 - Start Backend
cd c:\Users\yashv\Documents\WSN\backend
python main.py

# Terminal 2 - Start Frontend
cd c:\Users\yashv\Documents\WSN\frontend
npm run dev

# Check backend health
curl http://localhost:8000/api/health

# View API docs
http://localhost:8000/docs
```

**Your system is now fully integrated and ready to use!** 🎉
