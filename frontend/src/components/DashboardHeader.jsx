export default function DashboardHeader({ farmSecure }) {
  return (
    <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/50 shadow-2xl backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">🛡</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Farm Guardian</h1>
                <span className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-slate-300 border border-slate-700/50">v1.0</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">Advanced Intruder Detection System</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 ${
                farmSecure 
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
                  : 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  farmSecure ? 'bg-emerald-400' : 'bg-rose-400'
                } ${!farmSecure ? 'animate-pulse' : 'animate-none'}`}></div>
                <span className={`font-semibold text-sm tracking-wide ${
                  farmSecure ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {farmSecure ? '● SECURE' : '● ALERT'}
                </span>
              </div>
            </div>
            {/* System Time */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">System Time</p>
              <p className="text-sm font-mono text-slate-300">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
