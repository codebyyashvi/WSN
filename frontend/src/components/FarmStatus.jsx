export default function FarmStatus({ farmSecure, intruderCount }) {
  return (
    <div className={`rounded-xl shadow-2xl p-8 border backdrop-blur-sm transition-all duration-500 ${
      farmSecure
        ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900/50 to-slate-950/30 border-emerald-500/30 hover:border-emerald-400/50'
        : 'bg-gradient-to-br from-rose-950/40 via-slate-900/50 to-slate-950/30 border-rose-500/50 animate-pulse shadow-rose-500/20'
    }`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-3xl ${farmSecure ? '✓' : '⚠'}`}></span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {farmSecure ? 'ARTIFACTS SECURE' : 'THEFT ALERT - BREACH DETECTED'}
            </h2>
          </div>
          <p className={`text-base font-medium ${
            farmSecure ? 'text-emerald-300/80' : 'text-rose-300/80'
          }`}>
            {farmSecure 
              ? 'All monitoring systems operational • No unauthorized access • Collection protected'
              : `CRITICAL: ${intruderCount} unauthorized access attempt(s) detected`
            }
          </p>
        </div>
        <div className={`text-5xl p-4 rounded-lg backdrop-blur-sm ${
          farmSecure 
            ? 'bg-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/20 text-rose-300 animate-bounce'
        }`}>
          {farmSecure ? '🏛️' : '🚨'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[
          { label: 'Sensor Nodes', value: '5', icon: '📡' },
          { label: 'Gallery Coverage', value: '100%', icon: '🏛️' },
          { label: 'Intrusions Detected', value: intruderCount, icon: '🚨', critical: intruderCount > 0 },
          { label: 'System Status', value: 'LIVE', icon: '✓', online: true }
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-lg p-4 border backdrop-blur-sm transition-all hover:scale-105 ${
            stat.critical
              ? 'bg-rose-950/30 border-rose-500/30'
              : stat.online
              ? 'bg-emerald-950/20 border-emerald-500/20'
              : 'bg-slate-800/40 border-slate-700/40'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${
              stat.critical ? 'text-rose-400' : stat.online ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
