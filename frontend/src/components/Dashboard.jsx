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

  // Simulate sensor data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sensor readings
      const newUltrasonic = Math.random() * 300
      const newTemp = 25 + Math.random() * 10
      const newHumidity = 50 + Math.random() * 30
      const newSignal = 85 + Math.random() * 15

      setSensorData({
        ultrasonic: Math.round(newUltrasonic),
        temperature: Math.round(newTemp * 10) / 10,
        humidity: Math.round(newHumidity),
        signal: Math.round(newSignal)
      })

      // Check for intrusion (ultrasonic < 50cm)
      if (newUltrasonic < 50) {
        setIsDetected(true)
        setDevices({
          led_status: true,
          buzzer_status: true,
          servo_status: true
        })
        setLastDetectionTime(new Date())

        // Add alert if not already exists
        if (intruders.length === 0) {
          const detectedZone = `zone${Math.floor(Math.random() * 5) + 1}`
          const newAlert = {
            id: Date.now(),
            zone: detectedZone,
            timestamp: new Date(),
            severity: 'CRITICAL',
            distance: Math.round(newUltrasonic)
          }
          setIntruders([newAlert])
          // Update zone data
          setZoneData(prev => ({
            ...prev,
            [detectedZone]: 'INTRUDER DETECTED'
          }))
        }
      } else {
        setIsDetected(false)
        setDevices({
          led_status: false,
          buzzer_status: false,
          servo_status: false
        })
        setIntruders([])
        // Reset zones
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
  }, [intruders.length])

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
  }

  const handleZoneClick = (zone) => {
    setZoneData(prev => ({
      ...prev,
      [zone]: 'INTRUDER DETECTED'
    }))
    const newAlert = {
      id: Date.now(),
      zone: zone,
      timestamp: new Date(),
      severity: 'CRITICAL',
      distance: Math.round(Math.random() * 30)
    }
    setIntruders([newAlert])
    setIsDetected(true)
    setDevices({
      led_status: true,
      buzzer_status: true,
      servo_status: true
    })
    setLastDetectionTime(new Date())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <DashboardHeader farmSecure={!isDetected} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Detection Status - Full Width */}
        <DetectionStatus isDetected={isDetected} lastDetectionTime={lastDetectionTime} />

        {/* Sensor Monitoring & Device Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sensors & Devices */}
          <div className="lg:col-span-2 space-y-6">
            <SensorMonitoring sensorData={sensorData} />
            <DeviceControl devices={devices} />
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
                  onClick={() => window.location.reload()}
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

