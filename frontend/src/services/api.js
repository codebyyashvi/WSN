const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Custom fetch wrapper with error handling
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
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
