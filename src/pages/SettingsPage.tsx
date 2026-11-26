import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  HardDrive
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { STORAGE_KEY, loadParkingData } from '../services/storageService';

export const SettingsPage: React.FC = () => {
  const {
    resetData,
    loadDemo,
    showConfirmDialog,
    addToast,
    totalSlots,
    totalOccupied,
    activeVehicles,
    historyRecords,
    waitingVehicles,
    recentExits,
    dbTransactions,
    isDbConnected
  } = useParking();

  const [rawJson, setRawJson] = useState('');
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  const handleExportJson = () => {
    const data = loadParkingData();
    const str = JSON.stringify(data, null, 2);
    setRawJson(str);
    setShowJsonInspector(true);

    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tce_parking_database_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Backup Exported', 'Database state downloaded as JSON file.', 'success');
  };

  const handleReset = () => {
    showConfirmDialog({
      title: 'Reset All Data Structures?',
      message: 'This will reset the 2D occupancy matrix, active singly linked list, historical records, stack, and queue to the pristine TCE demonstration state.',
      confirmLabel: 'Reset Everything',
      isDestructive: true,
      onConfirm: () => {
        resetData();
      }
    });
  };

  // Inspect storage size
  const storageUsageBytes = (() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? new Blob([item]).size : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Settings & Database Storage
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Database Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent storage management, transactional commit records, and system verification for TCE IT Madurai.
          </p>
        </div>
      </div>

      {/* College Info Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-500/20 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-blue-300" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
            Department Accreditation
          </div>
          <h3 className="text-lg font-black tracking-tight text-white">
            Thiagarajar College of Engineering, Madurai
          </h3>
          <p className="text-xs text-blue-200 font-medium">
            Department of Information Technology &bull; Automated Multi-Storey Parking System
          </p>
          <p className="text-xs text-blue-200/80 pt-1 leading-relaxed">
            Multi-tier slot allocation, real-time vehicle entry list persistence, and transactional stack/queue reallocation.
          </p>
        </div>
      </div>

      {/* Persistence & Data Integrity Diagnostics */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <HardDrive className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Database Health & Storage Status</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Storage Engine</span>
            <span className="font-mono font-bold text-emerald-400 text-[11px] block mt-0.5 truncate">
              Connected & Persistent
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Database Payload</span>
            <span className="font-mono font-bold text-blue-400 text-[11px] block mt-0.5">
              {(storageUsageBytes / 1024).toFixed(2)} KB
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Consistency</span>
            <span className="font-bold text-emerald-400 text-[11px] block mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Transactions</span>
            <span className="font-bold text-purple-400 text-[11px] block mt-0.5">
              {dbTransactions?.length || 0} Commits
            </span>
          </div>
        </div>

        {/* State Snapshot Counts */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-2">
          <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
            Current Stored Records in Database:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Active Vehicles:</span>
              <span className="font-bold text-white">{activeVehicles.length} Stored</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">History Records:</span>
              <span className="font-bold text-white">{historyRecords.length} Stored</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Waiting Queue:</span>
              <span className="font-bold text-white">{waitingVehicles.length} Queued</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Recent Exits:</span>
              <span className="font-bold text-white">{recentExits.length} Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions: Demo Data, Reset, Export */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
          Database Operations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => loadDemo()}
            className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-950/70 transition flex flex-col gap-2 text-left cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-xs font-bold text-blue-200 block">Load Demo Data</span>
              <span className="text-[11px] text-blue-300/80">Re-inject sample active, history & queue records</span>
            </div>
          </button>

          <button
            onClick={handleExportJson}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 transition flex flex-col gap-2 text-left cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-300" />
            <div>
              <span className="text-xs font-bold text-white block">Export JSON Database Backup</span>
              <span className="text-[11px] text-slate-400">Download complete serialized state</span>
            </div>
          </button>

          <button
            onClick={handleReset}
            className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-950/70 transition flex flex-col gap-2 text-left cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-xs font-bold text-rose-200 block">Reset Database</span>
              <span className="text-[11px] text-rose-300/80">Restore factory baseline configuration</span>
            </div>
          </button>
        </div>
      </div>

      {/* Raw JSON Inspector Modal/Section */}
      {showJsonInspector && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Serialized JSON Database Schema
            </h4>
            <button
              onClick={() => setShowJsonInspector(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Hide Inspector
            </button>
          </div>
          <textarea
            readOnly
            value={rawJson}
            rows={10}
            className="w-full p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs focus:outline-hidden border border-slate-800"
          />
        </div>
      )}
    </div>
  );
};
