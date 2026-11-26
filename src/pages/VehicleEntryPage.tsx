import React, { useState } from 'react';
import {
  LogIn,
  Car,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Search,
  LogOut,
  Clock,
  ListTree,
  Users,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { AllocationResult, ParkingCategory, VehicleType } from '../types';
import { NavPage } from '../components/Sidebar';

interface VehicleEntryPageProps {
  onNavigate: (page: NavPage, params?: any) => void;
}

export const VehicleEntryPage: React.FC<VehicleEntryPageProps> = ({ onNavigate }) => {
  const {
    parkVehicle,
    enqueueWaitingVehicle,
    grid,
    activeVehicles,
    exitVehicle,
    showConfirmDialog,
    dbTransactions,
    isDbConnected,
    lastEnteredPlate
  } = useParking();

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [parkingCategory, setParkingCategory] = useState<ParkingCategory>('Normal');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const generateSamplePlate = () => {
    const letters = ['AB', 'BC', 'CD', 'EF', 'GH', 'KL', 'MN'][Math.floor(Math.random() * 7)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setRegistrationNumber(`TN-58-${letters}-${num}`);
    setOwnerName(['Karthik Raja', 'Priya Sundaram', 'Venkatesh S', 'Anitha Devi', 'Muthu Kumar'][Math.floor(Math.random() * 5)]);
    setContactNumber(`9842${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Result state
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [entrySearch, setEntrySearch] = useState('');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<number>(0);

  // Best floor recommendation for the currently selected category
  const recommendation = grid.suggestBestFloor(parkingCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parkVehicle({
      registrationNumber,
      vehicleType,
      parkingCategory,
      ownerName: ownerName || undefined,
      contactNumber: contactNumber || undefined
    });
    setAllocationResult(result);

    if (result.success) {
      // Clear form inputs so the operator can swiftly enter the next vehicle
      setRegistrationNumber('');
      setOwnerName('');
      setContactNumber('');
    }
  };

  const handleJoinQueue = () => {
    if (!registrationNumber.trim()) return;
    enqueueWaitingVehicle({
      registrationNumber,
      vehicleType,
      parkingCategory,
      ownerName: ownerName || undefined,
      contactNumber: contactNumber || undefined
    });
    onNavigate('queue');
  };

  const handleQuickExit = (plate: string, floor: number, slot: number) => {
    showConfirmDialog({
      title: 'Confirm Vehicle Exit',
      message: `Process exit for vehicle ${plate} from Floor ${floor}, Slot ${slot}? This will update the database and vacate the slot.`,
      confirmLabel: 'Confirm Exit',
      isDestructive: true,
      onConfirm: () => exitVehicle(plate)
    });
  };

  const cleanQuery = entrySearch.trim().toUpperCase();
  const filteredEntryList = activeVehicles.filter((v) => {
    if (selectedFloorFilter !== 0 && v.floorNumber !== selectedFloorFilter) return false;
    if (cleanQuery) {
      const matchPlate = v.registrationNumber.toUpperCase().includes(cleanQuery);
      const matchOwner = v.ownerName?.toUpperCase().includes(cleanQuery) ?? false;
      if (!matchPlate && !matchOwner) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Database Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white tracking-tight">
              Vehicle Entry & Database Storage
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Database Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Allocate parking spaces and immediately persist entered vehicles into the database repository and live entry list.
          </p>
        </div>

        {/* Database Stats Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Stored in Database
            </span>
            <span className="text-sm font-black text-white">{activeVehicles.length} Vehicles Parked</span>
          </div>
          {recommendation.bestFloor && (
            <div className="hidden md:block px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-400 block">Best Floor:</span>
              <span className="font-bold text-white">Floor {recommendation.bestFloor}</span> ({recommendation.compatibleSlots} slots)
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Entry Form on Left (5 cols) & Allocation Notice on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">New Vehicle Registration</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Live DB Sync
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Plate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Vehicle Registration Number <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSamplePlate}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Auto-Fill Sample</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. TN-58-AB-1234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 font-mono font-bold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm tracking-wider uppercase"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter vehicle plate number (e.g. TN-58-AB-1234). Will be stored directly into database.
              </p>
            </div>

            {/* Vehicle Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Vehicle Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/90 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other (Van/SUV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={parkingCategory}
                  onChange={(e) => setParkingCategory(e.target.value as ParkingCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/90 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal Parking</option>
                  <option value="VIP">VIP Space</option>
                  <option value="Electric Vehicle">Electric Vehicle (EV)</option>
                  <option value="Disabled">Accessible (Disabled)</option>
                </select>
              </div>
            </div>

            {/* Owner Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Owner Name (Optional)
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/90 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contact Number (Optional)
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 9842100000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/90 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Allocate Slot & Save to Database</span>
            </button>
          </form>
        </div>

        {/* Right Column: Instant Result Card or Algorithm Details */}
        <div className="lg:col-span-7 space-y-4">
          {allocationResult ? (
            <div
              className={`rounded-2xl border p-5 shadow-xl backdrop-blur-md ${
                allocationResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      allocationResult.success ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {allocationResult.success ? <Check className="w-5 h-5 stroke-[3]" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {allocationResult.success ? 'Vehicle Successfully Stored in Database!' : 'Slot Allocation Failed'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{allocationResult.message}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  DB Commit ID: TX-{Date.now().toString().slice(-4)}
                </span>
              </div>

              {allocationResult.success && allocationResult.floor && allocationResult.slot && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Location</span>
                    <span className="text-lg font-black text-emerald-400 block mt-0.5 font-mono">
                      Floor {allocationResult.floor}, Slot {allocationResult.slot}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">2D Array Index</span>
                    <span className="text-xs font-bold text-slate-200 block mt-1 font-mono">
                      parking[{allocationResult.floor - 1}][{allocationResult.slot - 1}] = 1
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Storage State</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Persisted to DB
                    </span>
                  </div>
                </div>
              )}

              {!allocationResult.success && (
                <div className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-rose-500/30 flex items-center justify-between">
                  <p className="text-xs text-slate-300">
                    No vacant slot is currently available. Would you like to add this vehicle to the Waiting Queue?
                  </p>
                  <button
                    onClick={handleJoinQueue}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition shrink-0 ml-3"
                  >
                    Join Queue
                  </button>
                </div>
              )}

              {/* Algorithm Step Trace Toggle */}
              {allocationResult.trace && allocationResult.trace.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowTrace(!showTrace)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ListTree className="w-3.5 h-3.5" />
                    <span>{showTrace ? 'Hide Algorithm Steps' : `Show Algorithm Traversal Steps (${allocationResult.trace.length} evaluated)`}</span>
                  </button>

                  {showTrace && (
                    <div className="mt-2 p-3 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] max-h-44 overflow-y-auto space-y-1.5 border border-slate-800">
                      {allocationResult.trace.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-slate-500">#{idx + 1}</span>
                          <span className={step.status === 'allocated' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {step.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center text-center text-slate-400 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Database Vehicle Entry Interface</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Fill the registration form to allocate the first available compatible slot and store the vehicle into the database entry list below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VEHICLE ENTRY LIST (PERSISTED IN DATABASE) - REQUESTED BY USER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                Vehicle Entry List (Stored in Database)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {activeVehicles.length} Active Records
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every vehicle entered in the form is recorded and stored here in real-time.
            </p>
          </div>

          {/* Search & Floor Filters */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={entrySearch}
                onChange={(e) => setEntrySearch(e.target.value)}
                placeholder="Search entered plate..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedFloorFilter}
              onChange={(e) => setSelectedFloorFilter(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white"
            >
              <option value={0}>All Floors</option>
              <option value={1}>Floor 1</option>
              <option value={2}>Floor 2</option>
              <option value={3}>Floor 3</option>
              <option value={4}>Floor 4</option>
              <option value={5}>Floor 5</option>
            </select>
          </div>
        </div>

        {/* The Live Vehicle Entry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Vehicle Registration</th>
                <th className="py-3 px-4">Type & Category</th>
                <th className="py-3 px-4">Assigned Location</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Entry Timestamp</th>
                <th className="py-3 px-4">Database State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-200">
              {filteredEntryList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No vehicles found in the entry list matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredEntryList.map((v, idx) => {
                  const isJustEntered = v.registrationNumber === lastEnteredPlate;
                  return (
                    <tr
                      key={v.registrationNumber}
                      className={`transition ${
                        isJustEntered
                          ? 'bg-emerald-950/80 border-y-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-white text-xs">
                            {v.registrationNumber}
                          </span>
                          {isJustEntered && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400 text-slate-950 animate-pulse uppercase tracking-wider">
                              ★ Just Entered & Stored
                            </span>
                          )}
                        </div>
                        {v.contactNumber && (
                          <div className="text-[10px] text-slate-400">{v.contactNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-300">{v.vehicleType}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {v.parkingCategory}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        Floor {v.floorNumber}, Slot {v.slotNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {v.ownerName || <span className="text-slate-500 italic">Unrecorded</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(v.entryTimestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Stored in DB
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleQuickExit(v.registrationNumber, v.floorNumber, v.slotNumber)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition cursor-pointer"
                        >
                          Exit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Database Storage: Synchronized & Live Across Reloads</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Total Parked: {activeVehicles.length} &bull; Total Served: {activeVehicles.length + (dbTransactions?.length || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
