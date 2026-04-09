import { useState } from 'react'

export default function DeviceControl({ devices, setDevices }) {
  const [error, setError] = useState(null)

  const toggleDevice = (deviceType) => {
    setError(null)
    try {
      const newState = !devices?.[`${deviceType}_status`]
      
      setDevices(prev => ({
        ...prev,
        [`${deviceType}_status`]: newState
      }))
    } catch (err) {
      console.error(`Failed to control ${deviceType}:`, err)
      setError(`Failed to control ${deviceType}`)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50 backdrop-blur-sm">
      <div className="mb-6 pb-4 border-b border-slate-800/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎛️</span>
          Security Devices
        </h3>
        <p className="text-xs text-slate-400 mt-1">Emergency Response Controls</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-sm text-red-200">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* LED Status */}
        <div className={`rounded-lg p-5 border-2 transition-all cursor-pointer hover:shadow-lg ${
          devices?.led_status
            ? 'bg-gradient-to-br from-yellow-950/40 to-slate-900/40 border-yellow-500/60 shadow-lg shadow-yellow-500/20'
            : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/40 hover:border-slate-600/60'
        }`}
        onClick={() => toggleDevice('led')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">💡</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              devices?.led_status
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {devices?.led_status ? 'ON' : 'OFF'}
            </span>
          </div>
          <h4 className="font-semibold text-white mb-2">Alert Lights</h4>
          <div className={`w-full h-2 rounded-full transition-colors ${
            devices?.led_status ? 'bg-yellow-500' : 'bg-slate-700'
          }`}></div>
          <p className="text-xs text-slate-400 mt-3">Click to toggle</p>
        </div>

        {/* Buzzer Status */}
        <div className={`rounded-lg p-5 border-2 transition-all cursor-pointer hover:shadow-lg ${
          devices?.buzzer_status
            ? 'bg-gradient-to-br from-red-950/40 to-slate-900/40 border-red-500/60 shadow-lg shadow-red-500/20 animate-pulse'
            : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/40 hover:border-slate-600/60'
        }`}
        onClick={() => toggleDevice('buzzer')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🔔</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              devices?.buzzer_status
                ? 'bg-red-500/20 text-red-300'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {devices?.buzzer_status ? 'ON' : 'OFF'}
            </span>
          </div>
          <h4 className="font-semibold text-white mb-2">Emergency Siren</h4>
          <div className={`w-full h-2 rounded-full transition-colors ${
            devices?.buzzer_status ? 'bg-red-500' : 'bg-slate-700'
          }`}></div>
          <p className="text-xs text-slate-400 mt-3">Click to toggle</p>
        </div>

        {/* Servo/Motor Status */}
        <div className={`rounded-lg p-5 border-2 transition-all cursor-pointer hover:shadow-lg ${
          devices?.servo_status
            ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
            : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/40 hover:border-slate-600/60'
        }`}
        onClick={() => toggleDevice('servo')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">⚙️</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              devices?.servo_status
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {devices?.servo_status ? 'ROTATING' : 'IDLE'}
            </span>
          </div>
          <h4 className="font-semibold text-white mb-2">Servo Motor</h4>
          <div className="flex gap-1 items-end h-6 mb-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  devices?.servo_status ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                style={{ 
                  height: `${devices?.servo_status ? (i + 1) * 15 : 10}%`,
                  opacity: devices?.servo_status ? 1 : 0.5
                }}
              ></div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Click to toggle</p>
        </div>
      </div>

      {/* Device Summary */}
      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Alerts</p>
        <div className="flex gap-2 flex-wrap">
          {devices?.led_status && (
            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs rounded-full font-semibold">
              💡 LED
            </span>
          )}
          {devices?.buzzer_status && (
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-full font-semibold">
              🔔 Buzzer
            </span>
          )}
          {devices?.servo_status && (
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs rounded-full font-semibold">
              ⚙️ Motor
            </span>
          )}
          {!devices?.led_status && !devices?.buzzer_status && !devices?.servo_status && (
            <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full font-semibold">
              No active devices
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
