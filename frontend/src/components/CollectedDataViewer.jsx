import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CollectedDataViewer() {
  const [collectedData, setCollectedData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollectedData();
  }, []);

  const fetchCollectedData = async () => {
    try {
      setLoading(true);
      const response = await api.getCollectedData();
      if (response.status === 'success') {
        setCollectedData(response.data);
        if (response.data.zones && response.data.zones.length > 0) {
          setSelectedZone(response.data.zones[0]);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch collected data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50">
        <div className="text-center text-slate-400">Loading collected data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-red-800/50">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!collectedData) {
    return (
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50">
        <div className="text-slate-400">No collected data available</div>
      </div>
    );
  }

  const summary = collectedData.summary_statistics || {};
  const zones = collectedData.zones || [];
  const intruders = collectedData.intruder_detections || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50 backdrop-blur-sm">
        <div className="mb-4 pb-4 border-b border-slate-800/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">📈</span>
            Collected Real-Time Data
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Historical sensor readings from {collectedData.metadata?.collection_date || 'unknown date'}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-slate-400">Total Readings</p>
            <p className="text-2xl font-bold text-blue-400">{summary.total_readings || 0}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-slate-400">Alert Events</p>
            <p className="text-2xl font-bold text-red-400">{summary.alert_events || 0}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <p className="text-xs text-slate-400">Avg Temperature</p>
            <p className="text-2xl font-bold text-orange-400">{summary.average_temperature?.toFixed(1) || 0}°C</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <p className="text-xs text-slate-400">Avg Humidity</p>
            <p className="text-2xl font-bold text-purple-400">{summary.average_humidity?.toFixed(0) || 0}%</p>
          </div>
        </div>
      </div>

      {/* Zones Tab */}
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-slate-800/50">
        <div className="mb-4 pb-4 border-b border-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Monitoring Zones
          </h3>
        </div>

        {/* Zone Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {zones.map((zone) => (
            <button
              key={zone.zone_id}
              onClick={() => setSelectedZone(zone)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedZone?.zone_id === zone.zone_id
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-blue-500/30'
              }`}
            >
              <p className="font-semibold text-white">{zone.zone_name}</p>
              <p className="text-xs text-slate-400">{zone.device_id}</p>
              <p className="text-sm text-slate-300 mt-2">{zone.readings.length} readings</p>
            </button>
          ))}
        </div>

        {/* Zone Readings */}
        {selectedZone && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300 mb-3">
              Recent Readings - {selectedZone.zone_name}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-2 px-3 text-slate-400">Timestamp</th>
                    <th className="text-right py-2 px-3 text-slate-400">Distance (cm)</th>
                    <th className="text-right py-2 px-3 text-slate-400">Temp (°C)</th>
                    <th className="text-right py-2 px-3 text-slate-400">Humidity (%)</th>
                    <th className="text-right py-2 px-3 text-slate-400">Signal</th>
                    <th className="text-center py-2 px-3 text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedZone.readings.slice(-10).reverse().map((reading, idx) => (
                    <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-slate-300 text-xs">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        <span className={`${
                          reading.ultrasonic < 100 ? 'text-red-400 font-semibold' : 'text-blue-400'
                        }`}>
                          {reading.ultrasonic}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {reading.temperature.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {reading.humidity}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {reading.signal}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                          reading.status === 'ALERT'
                            ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                            : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        }`}>
                          {reading.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Intruder Detections */}
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl shadow-xl p-6 border border-red-800/30">
        <div className="mb-4 pb-4 border-b border-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            Intruder Detections ({intruders.length})
          </h3>
        </div>

        <div className="space-y-3">
          {intruders.length > 0 ? (
            intruders.map((intruder, idx) => (
              <div
                key={idx}
                className="bg-red-950/20 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-red-300">{intruder.id}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(intruder.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-mono ${
                    intruder.threat_level === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-500/50 text-orange-200'
                  }`}>
                    {intruder.threat_level}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{intruder.details}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Zone</p>
                    <p className="text-slate-200">{intruder.zone_id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Distance</p>
                    <p className="text-red-400">{intruder.detected_distance} cm</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Confidence</p>
                    <p className="text-slate-200">{(intruder.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="text-slate-200">{intruder.duration_seconds}s</p>
                  </div>
                </div>
                {intruder.actions_taken && (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-xs text-slate-500 mb-1">Actions Taken:</p>
                    <div className="flex flex-wrap gap-1">
                      {intruder.actions_taken.map((action, i) => (
                        <span
                          key={i}
                          className="text-xs bg-red-500/20 border border-red-500/30 px-2 py-1 rounded"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No intruder detections in this period</p>
          )}
        </div>
      </div>
    </div>
  );
}
