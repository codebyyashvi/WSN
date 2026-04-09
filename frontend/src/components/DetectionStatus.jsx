export default function DetectionStatus({ isDetected, lastDetectionTime }) {
  return (
    <div className={`rounded-xl shadow-xl p-8 border backdrop-blur-sm transition-all duration-500 ${
      isDetected
        ? 'bg-gradient-to-br from-rose-950/40 via-slate-900/50 to-slate-950/30 border-rose-500/50 animate-pulse shadow-rose-500/20'
        : 'bg-gradient-to-br from-emerald-950/30 via-slate-900/50 to-slate-950/30 border-emerald-500/30'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {isDetected ? (
              <>
                <span className="text-4xl animate-bounce">🚨</span>
                THEFT ATTEMPT DETECTED
              </>
            ) : (
              <>
                <span className="text-4xl">✓</span>
                ARTIFACTS PROTECTED
              </>
            )}
          </h2>
          <p className={`text-base font-medium mt-2 ${
            isDetected ? 'text-rose-300/80' : 'text-emerald-300/80'
          }`}>
            {isDetected
              ? 'Proximity sensor detected unauthorized access near artifact'
              : 'All sensors nominal • Collection fully protected'
            }
          </p>
        </div>
      </div>

      {/* Detection Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Threat Status</p>
          <p className={`text-2xl font-bold ${isDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isDetected ? '🚨 ALERT' : '✓ SAFE'}
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Incident</p>
          <p className="text-2xl font-bold text-slate-300">
            {lastDetectionTime ? new Date(lastDetectionTime).toLocaleTimeString() : 'None'}
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Status</p>
          <p className="text-2xl font-bold text-blue-400">MONITORING</p>
        </div>
      </div>

      {isDetected && (
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-950/50 to-slate-900/30 border border-rose-600/40 rounded-lg">
          <p className="text-sm text-rose-300 font-semibold">🚨 SECURITY RESPONSE ACTIVE</p>
          <p className="text-xs text-rose-200/70 mt-2">
            • Emergency lights activated • Alarm sounding • Security cameras recording • Authorities notified • Data logged
          </p>
        </div>
      )}
    </div>
  )
}
