import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import SensorMonitoring from './SensorMonitoring'
import DetectionStatus from './DetectionStatus'
import DeviceControl from './DeviceControl'
import IntruderAlerts from './IntruderAlerts'
import FarmMap from './FarmMap'
import api from '../services/api'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      const [dashboardData, intrudersData, zonesData] = await Promise.all([
        api.getDashboard(),
        api.getIntruders(),
        api.getZones()
      ])

      // Update sensors
      if (dashboardData.sensors) {
        setSensorData({
          ultrasonic: dashboardData.sensors.ultrasonic,
          temperature: dashboardData.sensors.temperature,
          humidity: dashboardData.sensors.humidity,
          signal: dashboardData.sensors.signal
        })
      }

      // Update devices
      if (dashboardData.devices) {
        setDevices({
          led_status: dashboardData.devices.led_status,
          buzzer_status: dashboardData.devices.buzzer_status,
          servo_status: dashboardData.devices.servo_status
        })
      }

      // Update zones
      if (zonesData.zones) {
        const zoneMapping = {}
        Object.entries(zonesData.zones).forEach(([zoneId, zoneInfo]) => {
          zoneMapping[zoneId] = zoneInfo.status
        })
        setZoneData(zoneMapping)
      }

      // Update intruders
      if (intrudersData.intruders && intrudersData.intruders.length > 0) {
        setIntruders(intrudersData.intruders)
        setIsDetected(true)
        setLastDetectionTime(new Date(intrudersData.intruders[0].timestamp))
      } else {
        setIntruders([])
        setIsDetected(false)
      }

      setError(null)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount and set up polling
  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Clear all intruder alerts from backend
  const clearAlerts = async () => {
    try {
      await api.clearAllIntruders()
      await api.controlDevices({
        led_status: false,
        buzzer_status: false,
        servo_status: false
      })
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
    } catch (err) {
      console.error('Failed to clear alerts:', err)
      setError('Failed to clear alerts')
    }
  }

  // Handle manual zone click
  const handleZoneClick = async (zone) => {
    try {
      const newAlert = {
        id: `intruder_${Date.now()}`,
        zone_id: zone,
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        details: 'Manual alert triggered'
      }
      
      await api.reportIntruder(newAlert)
      await api.controlDevices({
        led_status: true,
        buzzer_status: true,
        servo_status: true
      })
      
      setIsDetected(true)
      setLastDetectionTime(new Date())
      
      // Refresh dashboard data
      fetchDashboardData()
    } catch (err) {
      console.error('Failed to report intruder:', err)
      setError('Failed to report intruder')
    }
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
                  onClick={fetchDashboardData}
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

        {/* Farm Map - Full Width */}
        <FarmMap sensorData={zoneData} onZoneClick={handleZoneClick} />
      </div>
    </div>
  )
}

