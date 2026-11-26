import React, { useState } from 'react';
import {
  LogOut,
  Search,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ExitRecord, WaitingVehicle } from '../types';
import { NavPage } from '../components/Sidebar';

interface VehicleExitPageProps {
  onNavigate: (page: NavPage) => void;
  initialRegNo?: string;
}

export const VehicleExitPage: React.FC<VehicleExitPageProps> = ({ onNavigate, initialRegNo = '' }) => {
  const {
    activeVehicles,
    exitVehicle,
    showConfirmDialog
  } = useParking();

  const [searchReg, setSearchReg] = useState(initialRegNo);
  const [selectedReg, setSelectedReg] = useState<string | null>(initialRegNo ? initialRegNo.toUpperCase() : null);
  const [exitResult, setExitResult] = useState<{
    exitRecord: ExitRecord;
    reallocatedVehicle?: WaitingVehicle | null;
  } | null>(null);

  const cleanQuery = searchReg.trim().toUpperCase();

  // Find currently searched vehicle in active list
  const matchedVehicles = cleanQuery
    ? activeVehicles.filter(v => v.registrationNumber.toUpperCase().includes(cleanQuery))
    : activeVehicles;

  const currentSelectedVehicle = activeVehicles.find(
    v => v.registrationNumber.toUpperCase() === selectedReg
  );

  const calculateDuration = (entryIso: string) => {
    const entry = new Date(entryIso).getTime();
    const now = new Date().getTime();
    const mins = Math.max(1, Math.round((now - entry) / 60000));
    return mins;
  };

  const handleProcessExit = (regNo: string) => {
    const v = activeVehicles.find(item => item.registrationNumber.toUpperCase() === regNo.toUpperCase());
    if (!v) return;

    showConfirmDialog({
      title: 'Confirm Vehicle Exit',
      message: `Are you sure you want to process exit for vehicle ${v.registrationNumber} from Floor ${v.floorNumber}, Slot ${v.slotNumber}? This will vacate the slot in database, push the record onto Recent Exits Stack, and reallocate the slot to any waiting vehicle in queue.`,
      confirmLabel: 'Process Exit & Vacate',
      isDestructive: true,
      onConfirm: () => {
        const res = exitVehicle(regNo);
        if (res.success && res.exitRecord) {
          setExitResult({
            exitRecord: res.exitRecord,
            reallocatedVehicle: res.reallocatedVehicle
          });
          setSelectedReg(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Vehicle Exit & Slot Reallocation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Database Sync & Vacate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search active parked vehicles, compute parking duration, push snapshot to Recent Exits Stack, and promote eligible vehicles from Waiting Queue.
          </p>
        </div>
      </div>

      {/* Exit Result Banner if just exited */}
      {exitResult && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Exit Processed Successfully for {exitResult.exitRecord.registrationNumber}
              </h3>
              <p className="text-xs text-emerald-300 mt-0.5">
                Vacated Floor {exitResult.exitRecord.floorNumber}, Slot {exitResult.exitRecord.slotNumber} • Total Duration: {exitResult.exitRecord.parkingDurationMinutes} mins.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                LIFO Stack Operation
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                Pushed exit snapshot onto <code className="font-mono text-purple-400 font-bold">recentExitsStack</code>
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Waiting Queue Reallocation
              </span>
              {exitResult.reallocatedVehicle ? (
                <p className="font-semibold text-emerald-300 mt-1">
                  Slot immediately allocated to waiting vehicle{' '}
                  <span className="font-mono font-bold text-white">{exitResult.reallocatedVehicle.registrationNumber}</span>!
                </p>
              ) : (
                <p className="text-slate-400 mt-1">
                  No eligible vehicle in waiting queue. Slot is now free in database for general allocation.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => onNavigate('stack')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View in Recent Exits Stack</span>
            </button>
            <button
              onClick={() => setExitResult(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold rounded-lg transition border border-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search & Active Vehicle Selector (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Search Active Vehicles</h3>
            <span className="text-xs text-slate-400 font-mono">
              {activeVehicles.length} active in DB
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              placeholder="Search plate (e.g. TN-58)..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white placeholder-slate-500 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Select List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {matchedVehicles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active vehicles found matching "{searchReg}".
              </div>
            ) : (
              matchedVehicles.map((v) => {
                const isSelected = selectedReg === v.registrationNumber.toUpperCase();
                return (
                  <div
                    key={v.registrationNumber}
                    onClick={() => setSelectedReg(v.registrationNumber.toUpperCase())}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono font-bold text-xs text-white">
                          {v.registrationNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {v.vehicleType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          Floor {v.floorNumber}, Slot {v.slotNumber}
                        </span>
                        {v.ownerName && <span>• {v.ownerName}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        F{v.floorNumber}-S{v.slotNumber}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Vehicle Details & Exit Confirmation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {currentSelectedVehicle ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Vehicle Exit Inspector</h3>
                  <p className="text-xs text-slate-400">Inspect parking session before confirming exit</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/80">
                  Ready to Exit
                </span>
              </div>

              {/* Data Grid */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Registration Number</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {currentSelectedVehicle.registrationNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Type</span>
                    <span className="font-medium text-white mt-0.5 block">{currentSelectedVehicle.vehicleType}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                    <span className="font-medium text-white mt-0.5 block">{currentSelectedVehicle.parkingCategory}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Location</span>
                    <span className="font-mono font-bold text-blue-400 mt-0.5 block">
                      Floor {currentSelectedVehicle.floorNumber}, Slot {currentSelectedVehicle.slotNumber}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Entry Time</span>
                    <span className="font-medium text-white mt-0.5 block">
                      {new Date(currentSelectedVehicle.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-300 block">Computed Duration</span>
                      <span className="text-sm font-bold text-white">
                        {calculateDuration(currentSelectedVehicle.entryTimestamp)} minutes
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-blue-300 block">Standard Rate</span>
                    <span className="text-xs font-semibold text-blue-200">₹20 / hour</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleProcessExit(currentSelectedVehicle.registrationNumber)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Confirm Exit & Vacate Slot in Database</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center text-slate-400 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
              <LogOut className="w-12 h-12 text-slate-600 mb-3 stroke-1" />
              <h4 className="text-sm font-bold text-white">Select a Vehicle to Exit</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Choose an active vehicle from the list on the left or search by plate number to review parking duration and vacate the slot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
