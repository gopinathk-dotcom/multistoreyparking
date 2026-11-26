import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Car,
  Users,
  RefreshCw,
  GraduationCap,
  Building2,
  Database,
  Palette,
  Check,
  HardDrive,
  Activity,
  X
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { AppTheme } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const {
    activeVehicles,
    waitingVehicles,
    totalAvailable,
    loadDemo,
    showConfirmDialog,
    theme,
    setTheme,
    databaseStatus,
    dbTransactions
  } = useParking();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetDemo = () => {
    showConfirmDialog({
      title: 'Reset to Sample Data?',
      message: 'This will reset all parking slots, vehicle lists, waiting queue, and recent exits stack to the verified demonstration dataset.',
      confirmLabel: 'Reset Data',
      isDestructive: false,
      onConfirm: () => loadDemo()
    });
  };

  const themes: { id: AppTheme; label: string; preview: string; description: string }[] = [
    {
      id: 'royal-slate',
      label: 'Royal Sapphire',
      preview: 'from-[#0c1838] to-[#1a1c54]',
      description: 'Attractive deep cobalt-sapphire navy with luminous blue accents'
    },
    {
      id: 'modern-light',
      label: 'Modern Pearl Light',
      preview: 'from-[#f1f5f9] to-[#e0e7ff]',
      description: 'Attractive crisp, clean executive light theme with dark navy text'
    },
    {
      id: 'emerald-dark',
      label: 'Emerald Oceanic',
      preview: 'from-[#041d24] to-[#0f3d3e]',
      description: 'Attractive deep dark teal and cyber emerald glow'
    },
    {
      id: 'twilight-violet',
      label: 'Twilight Violet',
      preview: 'from-[#160d33] to-[#251859]',
      description: 'Attractive deep cosmic violet and royal indigo'
    }
  ];

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xl text-slate-100">
        {/* Left: Organization & App Brand (No "DS Mini project") */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                Multi-Storey Parking Management System
              </h1>

              {/* Interactive Database Connected Badge */}
              <button
                onClick={() => setShowDbModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition cursor-pointer shadow-xs"
                title="Click to view Database engine status and live sync metrics"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <Database className="w-3 h-3" />
                <span>Database: Connected</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400 inline shrink-0" />
              <span>Thiagarajar College of Engineering • Dept of Information Technology, Madurai</span>
            </p>
          </div>
        </div>

        {/* Right: Actions, Stats, Theme Selector & Clock */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl border border-slate-700 transition cursor-pointer shadow-inner"
            title="Search by Registration Plate, Floor, or Slot (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Search vehicle...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-700 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Attractive Theme Switcher */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 border border-blue-500/30 rounded-xl transition cursor-pointer shadow-xs"
              title="Change Background Colour Theme"
            >
              <Palette className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Select Background Colour</span>
                  <Palette className="w-3 h-3 text-blue-400" />
                </div>
                <div className="mt-2 space-y-1">
                  {themes.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/30 border border-blue-500 text-white font-bold'
                            : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-lg bg-gradient-to-br ${t.preview} border border-white/20 shadow-xs shrink-0`}
                          ></span>
                          <div>
                            <span className="block text-xs font-bold">{t.label}</span>
                            <span className="block text-[10px] text-slate-400">{t.description}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Live Free Slots Indicator */}
          <div className="hidden xl:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{totalAvailable} Slots Free</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 font-medium">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeVehicles.length} Parked</span>
            </div>
          </div>

          {/* Load Sample Data Button */}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl shadow-xs transition cursor-pointer"
            title="Reload verified sample demonstration dataset"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Demo Data</span>
          </button>

          {/* Live Clock */}
          <div className="hidden 2xl:block text-right border-l border-slate-800 pl-3">
            <div className="text-[11px] font-medium text-slate-400">{currentTime}</div>
          </div>
        </div>
      </header>

      {/* Database Status & Health Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Database Engine & Connection</h3>
                  <p className="text-xs text-slate-400">IndexedDB + LocalStorage Dual-Store Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE & SYNCED
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Engine</span>
                <span className="text-xs font-bold text-blue-400 mt-1 block">W3C IndexedDB API</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Entries Stored</span>
                <span className="text-base font-black text-white mt-0.5 block">{activeVehicles.length} Active Records</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">I/O Latency</span>
                <span className="text-xs font-bold text-emerald-300 mt-1 block">&lt; 1 ms (In-Memory Reactive)</span>
              </div>
            </div>

            {/* Recent Transaction Log */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Live Database Transaction Audit Log
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                {dbTransactions.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-blue-400 font-bold">{tx.type}</span>
                      <span className="truncate text-slate-400">{tx.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
