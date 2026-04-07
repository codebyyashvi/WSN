# Backend Setup & Configuration Guide

## Quick Start

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Backend
```bash
python main.py
```

You should see:
```
✓ WSN Backend started successfully
✓ Listening on port 8000
✓ API Documentation: http://localhost:8000/docs
```

### 3. Access the API
- **Interactive Docs**: http://localhost:8000/docs
- **API Root**: http://localhost:8000/api/health

## Project Structure

```
backend/
├── main.py                 # FastAPI application (MAIN FILE)
├── requirements.txt        # Python dependencies
├── .env                    # Environment configuration
├── README_FASTAPI.md       # FastAPI documentation
├── ESP8266_EXAMPLE.cpp     # Arduino code example
└── SETUP.md               # This file
```

## Environment Variables

Edit `.env` file to configure:

```env
# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Server port
PORT=8000

# Debug mode
DEBUG=True
```

## API Response Format

All endpoints follow a consistent response format:

### Success Response (2xx)
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": { /* response data */ },
  "timestamp": "2026-04-07T10:30:00.123456"
}
```

### Error Response (4xx/5xx)
```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2026-04-07T10:30:00.123456"
}
```

## Key Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sensors` | Get sensor readings |
| POST | `/api/sensors/bulk` | Update all sensors |
| GET | `/api/devices` | Get device status |
| POST | `/api/devices/control` | Control devices |
| GET | `/api/zones` | Get zone status |
| POST | `/api/intruders` | Report intruder |
| GET | `/api/dashboard` | Complete dashboard data |
| GET | `/api/health` | Health check |

## Integration with Frontend

The frontend expects these environment variables:

Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Then in your React components:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Fetch sensors
const response = await fetch(`${API_BASE}/sensors`);
const data = await response.json();
```

## Integration with ESP8266

1. Update ESP8266 code with your WiFi credentials
2. Set the backend URL:
   ```cpp
   const char* backendUrl = "http://192.168.1.100:8000";
   ```
3. Upload code to ESP8266
4. Monitor Serial output to verify connection
5. Check backend dashboard for incoming data

## Running in Production

### Using Gunicorn with Uvicorn Workers
```bash
pip install gunicorn

gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Database Upgrade Path

Currently using in-memory storage. For production, upgrade to:

### Option 1: SQLite (Easy)
```python
from sqlalchemy import create_engine
engine = create_engine("sqlite:///wsn.db")
```

### Option 2: PostgreSQL (Recommended)
```python
from sqlalchemy import create_engine
engine = create_engine("postgresql://user:password@localhost/wsn")
```

### Option 3: MongoDB
```python
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['wsn_db']
```

## Monitoring & Logging

Add to `main.py` for logging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

## Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :8000
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### CORS Issues
Make sure `FRONTEND_URL` in `.env` matches your frontend URL exactly

### Connection Refused from ESP8266
- Verify ESP8266 is on same network
- Check firewall settings
- Ensure backend is running
- Use IP address instead of localhost

### Import Errors
```bash
# Reinstall all dependencies
pip install --upgrade -r requirements.txt

# Or use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Performance Tips

1. **Increase Timeouts** for slow networks:
   ```python
   @app.post("/api/sensors/bulk")
   async def update_sensors(data: SensorData, background_tasks: BackgroundTasks):
       # Process immediately
       # Add heavy operations to background
   ```

2. **Add Caching** for frequent reads:
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   async def get_sensors():
       return sensors_db
   ```

3. **Enable Compression**:
   ```python
   from fastapi.middleware.gzip import GZIPMiddleware
   app.add_middleware(GZIPMiddleware, minimum_size=1000)
   ```

## Security Considerations

1. Add authentication:
   ```python
   from fastapi.security import HTTPBearer
   security = HTTPBearer()
   
   @app.post("/api/sensors")
   async def update_sensors(data: SensorData, credentials = Depends(security)):
       # Validate token
       return update_data(data)
   ```

2. Implement rate limiting:
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   
   @app.post("/api/sensors")
   @limiter.limit("10/minute")
   async def update_sensors(request: Request, data: SensorData):
       return update_data(data)
   ```

3. Use HTTPS in production:
   - Get SSL certificate (Let's Encrypt)
   - Configure in reverse proxy (Nginx)

## Next Steps

1. ✅ Backend is ready
2. Install dependencies: `pip install -r requirements.txt`
3. Run backend: `python main.py`
4. Update frontend `.env.local` with backend URL
5. Update ESP8266 code with backend IP
6. Test all integrations

## Support

For issues:
1. Check API docs at `http://localhost:8000/docs`
2. Review logs in terminal
3. Check network connectivity
4. Verify CORS settings
5. Check Firebase configuration (if using)
