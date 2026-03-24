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
                <span className="text-4xl animate-bounce">⚠️</span>
                INTRUDER DETECTED
              </>
            ) : (
              <>
                <span className="text-4xl">✓</span>
                SECURE - NO THREAT
              </>
            )}
          </h2>
          <p className={`text-base font-medium mt-2 ${
            isDetected ? 'text-rose-300/80' : 'text-emerald-300/80'
          }`}>
            {isDetected
              ? 'Ultrasonic sensor detected movement below 50cm threshold'
              : 'All sensors nominal • Zero intrusions detected'
            }
          </p>
        </div>
      </div>

      {/* Detection Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detection Status</p>
          <p className={`text-2xl font-bold ${isDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isDetected ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Detection</p>
          <p className="text-2xl font-bold text-slate-300">
            {lastDetectionTime ? new Date(lastDetectionTime).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Status</p>
          <p className="text-2xl font-bold text-blue-400">MONITORING</p>
        </div>
      </div>

      {isDetected && (
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-950/50 to-slate-900/30 border border-rose-600/40 rounded-lg">
          <p className="text-sm text-rose-300 font-semibold">⚡ ALERT TRIGGERED</p>
          <p className="text-xs text-rose-200/70 mt-2">
            • LED activated • Buzzer sounding • Servo Motor rotating to track intruder • Data transmitted to server
          </p>
        </div>
      )}
    </div>
  )
}
