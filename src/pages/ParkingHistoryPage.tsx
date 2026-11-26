import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Car,
  Download,
  Calendar,
  Layers,
  Database
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export const ParkingHistoryPage: React.FC = () => {
  const { historyRecords } = useParking();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [floorFilter, setFloorFilter] = useState<number>(0);

  const cleanQuery = search.trim().toUpperCase();

  // Filter history records
  const filteredRecords = historyRecords.filter((rec) => {
    if (floorFilter !== 0 && rec.floorNumber !== floorFilter) return false;
    if (statusFilter === 'active' && rec.exitTimestamp !== null) return false;
    if (statusFilter === 'completed' && rec.exitTimestamp === null) return false;
    if (cleanQuery) {
      const matchReg = rec.registrationNumber.toUpperCase().includes(cleanQuery);
      const matchOwner = rec.ownerName?.toUpperCase().includes(cleanQuery) ?? false;
      if (!matchReg && !matchOwner) return false;
    }
    return true;
  });

  // Calculate statistics
  const completedRecords = historyRecords.filter(r => r.exitTimestamp !== null);
  const activeCount = historyRecords.length - completedRecords.length;
  const avgDuration =
    completedRecords.length > 0
      ? Math.round(
          completedRecords.reduce((acc, r) => acc + (r.parkingDurationMinutes || 0), 0) /
            completedRecords.length
        )
      : 0;

  const exportCSV = () => {
    const headers = ['Record ID', 'Registration', 'Vehicle Type', 'Category', 'Floor', 'Slot', 'Entry Time', 'Exit Time', 'Duration (mins)'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.registrationNumber,
      r.vehicleType,
      r.parkingCategory,
      r.floorNumber,
      r.slotNumber,
      r.entryTimestamp,
      r.exitTimestamp || 'Active',
      r.parkingDurationMinutes || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tce_parking_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Parking Transaction History
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Database Audit Trail ({historyRecords.length} Records)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical transaction ledger preserving entry timestamps, exit timestamps, duration, and slot allocations.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto cursor-pointer border border-slate-700"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export History (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sessions Recorded</span>
          <div className="text-2xl font-black text-white mt-1">{historyRecords.length}</div>
          <span className="text-[11px] text-slate-500 font-mono">Stored in Database</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-blue-500/30 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Active Sessions</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{activeCount}</div>
          <span className="text-[11px] text-slate-400">Currently parked in facility</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Avg Parking Duration</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{avgDuration} min</div>
          <span className="text-[11px] text-slate-400">Calculated across completed exits</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by registration or owner..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'completed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed Exits
          </button>
        </div>

        {/* Floor Filter */}
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(Number(e.target.value))}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white"
        >
          <option value={0}>All Floors (1 - 5)</option>
          <option value={1}>Floor 1</option>
          <option value={2}>Floor 2</option>
          <option value={3}>Floor 3</option>
          <option value={4}>Floor 4</option>
          <option value={5}>Floor 5</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Entry Timestamp</th>
                <th className="py-3 px-4">Exit Timestamp</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No history records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isParked = rec.exitTimestamp === null;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{rec.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-xs">
                          {rec.registrationNumber}
                        </div>
                        {rec.ownerName && (
                          <div className="text-[10px] text-slate-400">{rec.ownerName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {rec.vehicleType} • {rec.parkingCategory}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        F{rec.floorNumber}-S{rec.slotNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(rec.entryTimestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {rec.exitTimestamp ? (
                          new Date(rec.exitTimestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-slate-500 italic">— Still Parked —</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rec.parkingDurationMinutes ? (
                          <span className="font-mono font-bold text-emerald-400">
                            {rec.parkingDurationMinutes} min
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Ongoing</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isParked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredRecords.length} records</span>
          <span className="font-mono text-[11px] text-slate-500">Audit Trail: Update-in-place on exit</span>
        </div>
      </div>
    </div>
  );
};
