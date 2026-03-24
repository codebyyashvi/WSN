export default function SensorMonitoring({ sensorData }) {
  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50 backdrop-blur-sm">
      <div className="mb-6 pb-4 border-b border-slate-800/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Sensor Readings
        </h3>
        <p className="text-xs text-slate-400 mt-1">ESP8266 Data Stream</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ultrasonic Distance */}
        <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📏</span>
              <span className="font-semibold text-slate-300">Ultrasonic</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-mono ${
              sensorData?.ultrasonic < 50
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
            }`}>
              {sensorData?.ultrasonic < 50 ? 'ALERT' : 'CLEAR'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400">{sensorData?.ultrasonic || 0}</span>
            <span className="text-slate-400 text-sm">cm</span>
          </div>
          <div className="mt-4 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                sensorData?.ultrasonic < 50 ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((sensorData?.ultrasonic || 0) / 3, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Motion Detection Threshold: 50cm</p>
        </div>

        {/* DHT11 Temperature */}
        <div className="bg-gradient-to-br from-orange-950/40 to-slate-900/40 rounded-lg p-4 border border-orange-500/30 hover:border-orange-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌡️</span>
              <span className="font-semibold text-slate-300">Temperature</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 border border-orange-500/50 text-orange-300 font-mono">
              NORMAL
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-400">{sensorData?.temperature || 0}</span>
            <span className="text-slate-400 text-sm">°C</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/50 rounded p-2">
              <p className="text-xs text-slate-500">Min</p>
              <p className="text-sm font-semibold text-slate-300">20°C</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <p className="text-xs text-slate-500">Current</p>
              <p className="text-sm font-semibold text-orange-300">{sensorData?.temperature || 0}°C</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <p className="text-xs text-slate-500">Max</p>
              <p className="text-sm font-semibold text-slate-300">35°C</p>
            </div>
          </div>
        </div>

        {/* DHT11 Humidity */}
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💧</span>
              <span className="font-semibold text-slate-300">Humidity</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono">
              {sensorData?.humidity < 30 ? 'LOW' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">{sensorData?.humidity || 0}</span>
            <span className="text-slate-400 text-sm">%</span>
          </div>
          <div className="mt-4 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${sensorData?.humidity || 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Range: 0-100%</p>
        </div>

        {/* Signal Strength */}
        <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/40 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📡</span>
              <span className="font-semibold text-slate-300">Signal</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono">
              STRONG
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400">{sensorData?.signal || 95}</span>
            <span className="text-slate-400 text-sm">%</span>
          </div>
          <div className="mt-4 flex gap-1 items-end h-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  (sensorData?.signal || 95) / 20 > i
                    ? 'bg-gradient-to-t from-purple-500 to-purple-400'
                    : 'bg-slate-700'
                }`}
                style={{ height: `${(i + 1) * 20}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
