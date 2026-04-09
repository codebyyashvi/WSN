import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import SensorMonitoring from './SensorMonitoring'
import DetectionStatus from './DetectionStatus'
import DeviceControl from './DeviceControl'
import IntruderAlerts from './IntruderAlerts'
import FarmMap from './FarmMap'

export default function Dashboard() {
  const [sensorData, setSensorData] = useState({
    ultrasonic: 150,
    temperature: 28,
    humidity: 65,
    signal: 95
  })

  const [zoneData, setZoneData] = useState({
    zone1: 'OK',
    zone2: 'OK',
    zone3: 'OK',
    zone4: 'OK',
    zone5: 'OK'
  })

  const [devices, setDevices] = useState({
    led_status: false,
    buzzer_status: false,
    servo_status: false
  })

  const [intruders, setIntruders] = useState([])
  const [isDetected, setIsDetected] = useState(false)
  const [lastDetectionTime, setLastDetectionTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Generate random sensor values (with occasional threat detection)
  const generateRandomSensorData = () => ({
    ultrasonic: Math.random() < 0.4 ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 200) + 51, // 40% chance of alert (10-50cm), 60% safe (51-250cm)
    temperature: Math.floor(Math.random() * 8) + 18,
    humidity: Math.floor(Math.random() * 40) + 30,
    signal: Math.floor(Math.random() * 30) + 70
  })

  // Initialize with mock data and set up periodic updates
  useEffect(() => {
    // Set initial random data
    setSensorData(generateRandomSensorData())
    setLoading(false)

    // Update sensor data every 3 seconds
    const interval = setInterval(() => {
      const newSensorData = generateRandomSensorData()
      setSensorData(newSensorData)

      // ONLY check ultrasonic/proximity - NO temperature or humidity checks
      if (newSensorData.ultrasonic < 50) {
        // Show alert only when proximity is strictly less than 50cm
        const threatAlert = {
          id: `auto_threat_${Date.now()}`,
          zone_id: `zone${Math.floor(Math.random() * 5) + 1}`,
          timestamp: new Date().toISOString(),
          confidence: 0.99,
          severity: 'CRITICAL',
          distance: newSensorData.ultrasonic
        }
        setIntruders([threatAlert])
        setIsDetected(true)
        setLastDetectionTime(new Date())
        // Activate all devices when alert triggered
        setDevices({
          led_status: true,
          buzzer_status: true,
          servo_status: true
        })
        // Update all zones to ALERT when proximity threat detected
        setZoneData({
          zone1: 'ALERT',
          zone2: 'ALERT',
          zone3: 'ALERT',
          zone4: 'ALERT',
          zone5: 'ALERT'
        })
      } else {
        // Clear all alerts when proximity is 50cm or more
        setIsDetected(false)
        setIntruders([])
        setDevices({
          led_status: false,
          buzzer_status: false,
          servo_status: false
        })
        // Reset all zones to OK
        setZoneData({
          zone1: 'OK',
          zone2: 'OK',
          zone3: 'OK',
          zone4: 'OK',
          zone5: 'OK'
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Clear all alerts locally
  const clearAlerts = () => {
    setIntruders([])
    setIsDetected(false)
    setDevices({
      led_status: false,
      buzzer_status: false,
      servo_status: false
    })
    setZoneData({
      zone1: 'OK',
      zone2: 'OK',
      zone3: 'OK',
      zone4: 'OK',
      zone5: 'OK'
    })
    setError(null)
  }

  // Handle manual zone click - disabled, alerts only from proximity sensor
  const handleZoneClick = (zone) => {
    // Alerts are now only triggered by proximity sensor (ultrasonic <= 50cm)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <DashboardHeader farmSecure={!isDetected} />
      
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200">
            <p className="text-sm">⚠️ {error}</p>
            <button 
              onClick={fetchDashboardData}
              className="text-xs mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Detection Status - Full Width */}
        <DetectionStatus isDetected={isDetected} lastDetectionTime={lastDetectionTime} />

        {/* Sensor Monitoring & Device Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sensors & Devices */}
          <div className="lg:col-span-2 space-y-6">
            <SensorMonitoring sensorData={sensorData} />
            <DeviceControl devices={devices} setDevices={setDevices} />
          </div>

          {/* Right Column - Alerts & Controls */}
          <div className="space-y-6 flex flex-col">
            <div className="flex-1">
              <IntruderAlerts intruders={intruders} />
            </div>
            
            {/* Control Panel */}
            <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50 backdrop-blur-sm">
              <div className="mb-6 pb-4 border-b border-slate-800/50">
                <h3 className="text-lg font-bold text-white">System Actions</h3>
                <p className="text-xs text-slate-400 mt-1">Manual Controls</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={clearAlerts}
                  disabled={intruders.length === 0}
                  className="w-full group relative overflow-hidden rounded-lg font-semibold py-3 px-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 group-hover:shadow-lg group-hover:shadow-emerald-600/50 transition-all disabled:shadow-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl disabled:hidden"></div>
                  <span className="relative flex items-center justify-center gap-2 text-white">
                    <span>✓</span>
                    Clear Alerts
                  </span>
                </button>
                <button
                  onClick={() => {
                    // Refresh button - can add local actions here
                    setError(null)
                  }}
                  className="w-full group relative overflow-hidden rounded-lg font-semibold py-3 px-4 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-600/50 transition-all"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                  <span className="relative flex items-center justify-center gap-2 text-white">
                    <span>🔄</span>
                    Refresh
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Museum Floor Plan - Full Width */}
        <FarmMap sensorData={zoneData} onZoneClick={handleZoneClick} />
      </div>
    </div>
  )
}

