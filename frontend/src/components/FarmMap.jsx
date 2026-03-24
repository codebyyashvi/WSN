export default function FarmMap({ sensorData, onZoneClick }) {
  const zones = [
    { id: 'zone1', label: 'North Gate', position: 'top-6 left-6', icon: '🔵' },
    { id: 'zone2', label: 'East Fence', position: 'top-6 right-6', icon: '🔵' },
    { id: 'zone3', label: 'Main Area', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', icon: '◉' },
    { id: 'zone4', label: 'West Perimeter', position: 'bottom-6 left-6', icon: '🔵' },
    { id: 'zone5', label: 'South Sector', position: 'bottom-6 right-6', icon: '🔵' }
  ]

  const getZoneStatus = (zoneId) => {
    const status = sensorData[zoneId]
    if (status === 'OK') {
      return {
        bg: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
        border: 'border-emerald-400/60',
        text: 'text-emerald-100',
        pulse: '',
        shadow: 'shadow-lg shadow-emerald-500/20'
      }
    } else {
      return {
        bg: 'bg-gradient-to-br from-rose-600 to-rose-700',
        border: 'border-rose-400/60',
        text: 'text-rose-100',
        pulse: 'animate-pulse',
        shadow: 'shadow-lg shadow-rose-600/40'
      }
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 rounded-xl shadow-2xl overflow-hidden border border-slate-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-950/80 px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <p>Perimeter Security Map</p>
            <p className="text-xs font-normal text-slate-400 mt-0.5">Real-time Sensor Monitoring</p>
          </div>
        </h3>
        <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs text-emerald-300 font-semibold">
          5 Zones Active
        </div>
      </div>

      {/* Farm Visualization */}
      <div className="relative w-full h-96 bg-gradient-to-br from-slate-800/30 via-slate-900/40 to-slate-950/30 p-6 overflow-hidden">
        {/* Animated Background Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Farm Boundary with Glow */}
        <div className="absolute inset-8 border-2 border-blue-500/20 rounded-xl shadow-lg shadow-blue-500/10 pointer-events-none"></div>

        {/* Sensor Zones */}
        {zones.map((zone) => {
          const status = getZoneStatus(zone.id)
          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${zone.position} group`}
            >
              <div className={`
                flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 
                ${status.bg} ${status.border} ${status.text} ${status.pulse} ${status.shadow}
                hover:scale-125 transition-all duration-300 cursor-pointer
                backdrop-blur-sm font-semibold
              `}>
                <div className="text-lg font-bold">
                  {zone.icon}
                </div>
                <span className="text-xs font-bold tracking-wider">
                  {zone.label}
                </span>
                <span className="text-xs opacity-90">
                  {sensorData[zone.id] === 'OK' ? '✓ ONLINE' : '⚠ BREACH'}
                </span>
              </div>
              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-2 bg-slate-950/95 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {sensorData[zone.id] === 'OK' ? 'Status: Secure' : 'Status: Intrusion Detected'}
              </div>
            </button>
          )
        })}

        {/* Center Farm Building with Enhanced Design */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-lg"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-amber-400 rounded-lg flex items-center justify-center shadow-xl shadow-amber-500/40">
              <span className="text-3xl">🏢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-slate-900/80 px-6 py-4 border-t border-slate-800/50 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/50"></div>
          <span className="text-xs text-slate-300 font-medium">Secure Zone</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full animate-pulse shadow-lg shadow-rose-500/50"></div>
          <span className="text-xs text-slate-300 font-medium">Threat Detected</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>🔄</span>
          <span>Live Monitoring</span>
        </div>
      </div>
    </div>
  )
}
