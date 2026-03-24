export default function IntruderAlerts({ intruders }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const zoneLabels = {
    zone1: 'North Gate',
    zone2: 'East Fence',
    zone3: 'Main Area',
    zone4: 'West Perimeter',
    zone5: 'South Sector'
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🚨</span>
          <div>
            <h3 className="text-lg font-bold text-white">Alert Log</h3>
            <p className="text-xs text-slate-500">Intrusion Events</p>
          </div>
        </div>
        {intruders.length > 0 && (
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg shadow-rose-500/30">
            {intruders.length} Active
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {intruders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center h-full">
            <span className="text-4xl mb-3">✓</span>
            <p className="text-slate-400 font-medium">No Intrusions</p>
            <p className="text-slate-600 text-sm mt-1">Farm is secure</p>
          </div>
        ) : (
          intruders.map((intruder) => (
            <div
              key={intruder.id}
              className="bg-gradient-to-r from-rose-950/50 to-slate-900/30 border border-rose-500/40 rounded-lg p-4 hover:border-rose-400/60 transition-all animate-pulse shadow-lg shadow-rose-500/10"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                    <p className="font-bold text-rose-300 text-sm tracking-wide">
                      {zoneLabels[intruder.zone] || intruder.zone}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {formatTime(intruder.timestamp)}
                  </p>
                </div>
                <span className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  {intruder.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300 ml-4">
                📏 Distance: {intruder.distance}cm
              </p>
            </div>
          ))
        )}
      </div>

      {/* Action Alert */}
      {intruders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <div className="bg-amber-950/40 border border-amber-600/50 rounded-lg p-3 flex items-start gap-3">
            <span className="text-lg min-w-fit">⚠️</span>
            <div>
              <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide">Immediate Action</p>
              <p className="text-amber-200/70 text-xs mt-1">
                Intruder detected on farm. Alert system activated: LED, Buzzer, and Servo Motor (rotating to track intruder).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
