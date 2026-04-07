# Frontend to Backend Integration Guide

## Setting Up Frontend Environment

### 1. Create `.env.local` in frontend directory

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_HOST=localhost:8000
```

### 2. Create API Service Layer

Create `frontend/src/services/api.js`:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create a custom fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ===== SENSOR ENDPOINTS =====

export const getSensors = async () => {
  return apiFetch('/sensors');
};

export const updateSensors = async (sensorData) => {
  return apiFetch('/sensors', {
    method: 'POST',
    body: JSON.stringify(sensorData),
  });
};

export const bulkUpdateSensors = async (sensorData) => {
  return apiFetch('/sensors/bulk', {
    method: 'POST',
    body: JSON.stringify(sensorData),
  });
};

// ===== DEVICE ENDPOINTS =====

export const getDevices = async () => {
  return apiFetch('/devices');
};

export const controlLED = async (status) => {
  return apiFetch('/devices/led', {
    method: 'POST',
    body: JSON.stringify({ led_status: status }),
  });
};

export const controlBuzzer = async (status) => {
  return apiFetch('/devices/buzzer', {
    method: 'POST',
    body: JSON.stringify({ buzzer_status: status }),
  });
};

export const controlServo = async (status) => {
  return apiFetch('/devices/servo', {
    method: 'POST',
    body: JSON.stringify({ servo_status: status }),
  });
};

export const controlDevices = async (deviceStates) => {
  return apiFetch('/devices/control', {
    method: 'POST',
    body: JSON.stringify(deviceStates),
  });
};

// ===== ZONE ENDPOINTS =====

export const getZones = async () => {
  return apiFetch('/zones');
};

export const getZone = async (zoneId) => {
  return apiFetch(`/zones/${zoneId}`);
};

export const updateZone = async (zoneId, zoneData) => {
  return apiFetch(`/zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(zoneData),
  });
};

// ===== INTRUDER ENDPOINTS =====

export const getIntruders = async () => {
  return apiFetch('/intruders');
};

export const reportIntruder = async (intruderData) => {
  return apiFetch('/intruders', {
    method: 'POST',
    body: JSON.stringify(intruderData),
  });
};

export const clearIntruder = async (intruderId) => {
  return apiFetch(`/intruders/${intruderId}`, {
    method: 'DELETE',
  });
};

export const clearAllIntruders = async () => {
  return apiFetch('/intruders', {
    method: 'DELETE',
  });
};

// ===== ALERT ENDPOINTS =====

export const getAlerts = async () => {
  return apiFetch('/alerts');
};

export const createAlert = async (alertData) => {
  return apiFetch('/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData),
  });
};

export const clearAlert = async (alertId) => {
  return apiFetch(`/alerts/${alertId}`, {
    method: 'DELETE',
  });
};

// ===== DASHBOARD ENDPOINTS =====

export const getDashboard = async () => {
  return apiFetch('/dashboard');
};

export const getDashboardSummary = async () => {
  return apiFetch('/dashboard/summary');
};

// ===== HEALTH CHECK =====

export const healthCheck = async () => {
  return apiFetch('/health');
};

export default {
  getSensors,
  updateSensors,
  bulkUpdateSensors,
  getDevices,
  controlLED,
  controlBuzzer,
  controlServo,
  controlDevices,
  getZones,
  getZone,
  updateZone,
  getIntruders,
  reportIntruder,
  clearIntruder,
  clearAllIntruders,
  getAlerts,
  createAlert,
  clearAlert,
  getDashboard,
  getDashboardSummary,
  healthCheck,
};
```

## Using API in Components

### Example 1: Dashboard Component

```jsx
// frontend/src/components/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Farm Security Dashboard</h1>
      
      {/* Sensors Section */}
      <div className="sensors">
        <h2>Sensors</h2>
        <p>Temperature: {dashboard.sensors.temperature}°C</p>
        <p>Humidity: {dashboard.sensors.humidity}%</p>
        <p>Distance: {dashboard.sensors.ultrasonic}cm</p>
        <p>Signal: {dashboard.sensors.signal}%</p>
      </div>

      {/* Alerts Section */}
      <div className="alerts">
        <h2>Alerts</h2>
        <p>Critical Alerts: {dashboard.alerts.count}</p>
      </div>

      {/* Intruders Section */}
      <div className="intruders">
        <h2>Intruders Detected</h2>
        <p>Count: {dashboard.intruders.count}</p>
      </div>
    </div>
  );
}
```

### Example 2: Device Control Component

```jsx
// frontend/src/components/DeviceControl.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DeviceControl() {
  const [devices, setDevices] = useState({
    led_status: false,
    buzzer_status: false,
    servo_status: false,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const data = await api.getDevices();
      setDevices({
        led_status: data.led_status,
        buzzer_status: data.buzzer_status,
        servo_status: data.servo_status,
      });
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const toggleLED = async () => {
    try {
      await api.controlLED(!devices.led_status);
      setDevices({ ...devices, led_status: !devices.led_status });
    } catch (err) {
      console.error('Failed to control LED:', err);
    }
  };

  const toggleBuzzer = async () => {
    try {
      await api.controlBuzzer(!devices.buzzer_status);
      setDevices({ ...devices, buzzer_status: !devices.buzzer_status });
    } catch (err) {
      console.error('Failed to control buzzer:', err);
    }
  };

  const toggleServo = async () => {
    try {
      await api.controlServo(!devices.servo_status);
      setDevices({ ...devices, servo_status: !devices.servo_status });
    } catch (err) {
      console.error('Failed to control servo:', err);
    }
  };

  return (
    <div className="device-control">
      <h2>Device Control</h2>
      <button 
        onClick={toggleLED}
        className={devices.led_status ? 'active' : 'inactive'}
      >
        LED: {devices.led_status ? 'ON' : 'OFF'}
      </button>
      
      <button 
        onClick={toggleBuzzer}
        className={devices.buzzer_status ? 'active' : 'inactive'}
      >
        Buzzer: {devices.buzzer_status ? 'ON' : 'OFF'}
      </button>
      
      <button 
        onClick={toggleServo}
        className={devices.servo_status ? 'active' : 'inactive'}
      >
        Servo: {devices.servo_status ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
```

### Example 3: Sensor Monitoring Component

```jsx
// frontend/src/components/SensorMonitoring.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function SensorMonitoring() {
  const [sensors, setSensors] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await api.getSensors();
        setSensors(data);
      } catch (err) {
        console.error('Failed to fetch sensors:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!sensors) return <div>Loading sensors...</div>;

  return (
    <div className="sensor-monitoring">
      <h2>Real-time Sensor Monitoring</h2>
      <div className="sensor-grid">
        <div className="sensor-card">
          <h3>Temperature</h3>
          <p>{sensors.temperature.toFixed(1)}°C</p>
        </div>
        <div className="sensor-card">
          <h3>Humidity</h3>
          <p>{sensors.humidity.toFixed(1)}%</p>
        </div>
        <div className="sensor-card">
          <h3>Distance</h3>
          <p>{sensors.ultrasonic.toFixed(1)} cm</p>
        </div>
        <div className="sensor-card">
          <h3>Signal</h3>
          <p>{sensors.signal} %</p>
        </div>
      </div>
    </div>
  );
}
```

### Example 4: Intruder Alerts Component

```jsx
// frontend/src/components/IntruderAlerts.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function IntruderAlerts() {
  const [intruders, setIntruders] = useState([]);

  useEffect(() => {
    fetchIntruders();
    const interval = setInterval(fetchIntruders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIntruders = async () => {
    try {
      const data = await api.getIntruders();
      setIntruders(data.intruders || []);
    } catch (err) {
      console.error('Failed to fetch intruders:', err);
    }
  };

  const handleClear = async (intruderId) => {
    try {
      await api.clearIntruder(intruderId);
      fetchIntruders();
    } catch (err) {
      console.error('Failed to clear intruder:', err);
    }
  };

  return (
    <div className="intruder-alerts">
      <h2>Intruder Alerts ({intruders.length})</h2>
      {intruders.length === 0 ? (
        <p>No intruders detected</p>
      ) : (
        <div className="alert-list">
          {intruders.map((intruder) => (
            <div key={intruder.id} className="alert-item">
              <p><strong>Zone:</strong> {intruder.zone_id}</p>
              <p><strong>Confidence:</strong> {(intruder.confidence * 100).toFixed(1)}%</p>
              <p><strong>Time:</strong> {new Date(intruder.timestamp).toLocaleString()}</p>
              <button 
                onClick={() => handleClear(intruder.id)}
                className="clear-btn"
              >
                Clear Alert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Using React Query (Optional but Recommended)

For better state management and caching:

```bash
npm install @tanstack/react-query
```

```jsx
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useSensors() {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: api.getSensors,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
    refetchInterval: 5000,
  });
}

// Usage in component:
function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

## Testing API Endpoints

### Using cURL

```bash
# Get sensors
curl http://localhost:8000/api/sensors

# Update sensors
curl -X POST http://localhost:8000/api/sensors/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ultrasonic": 150,
    "temperature": 28.5,
    "humidity": 65,
    "signal": 90
  }'

# Control LED
curl -X POST http://localhost:8000/api/devices/led \
  -H "Content-Type: application/json" \
  -d '{"led_status": true}'
```

### Using Postman

1. Import all endpoints from `http://localhost:8000/openapi.json`
2. Set up environment variable: `backend_url = http://localhost:8000/api`
3. Use `{{backend_url}}/sensors` in requests

## Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEBUG=true
```

### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
```

## Error Handling Pattern

```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      } else if (response.status === 500) {
        throw new Error('Server error');
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Show error toast/notification to user
    throw error;
  }
}
```

## WebSocket for Real-time Updates (Advanced)

For real-time updates without polling:

```javascript
// backend/main.py
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_json({
                "status": "received",
                "data": data
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
```

```javascript
// frontend/src/hooks/useWebSocket.js
export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update state with real-time data
    };
    ws.onclose = () => setConnected(false);
    
    return () => ws.close();
  }, []);
  
  return connected;
}
```

## Summary

✅ Backend is ready at `http://localhost:8000`
✅ Create API service in `frontend/src/services/api.js`
✅ Use in components with async/await or React Query
✅ Configure `.env.local` with backend URL
✅ Test with Swagger UI at `http://localhost:8000/docs`
