import React, { useState } from 'react';
import {
  BarChart3,
  Search,
  Car,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Compass,
  ArrowRight,
  History
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ParkingCategory } from '../types';
import { TOTAL_FLOORS, SLOTS_PER_FLOOR } from '../dataStructures/Array2D';

export const ParkingAnalysisPage: React.FC = () => {
  const {
    floorStats,
    grid,
    overallOccupancyPercent,
    totalSlots,
    totalOccupied,
    totalAvailable,
    totalReserved,
    totalOutOfService,
    activeVehicles,
    historyRecords
  } = useParking();

  // Search for vehicle history vs active
  const [searchReg, setSearchReg] = useState('');
  const [analyzedCategory, setAnalyzedCategory] = useState<ParkingCategory>('Normal');

  const extremes = grid.getExtremeFloors();
  const bestFloorRecommendation = grid.suggestBestFloor(analyzedCategory);

  const cleanQuery = searchReg.trim().toUpperCase();

  const activeMatch = cleanQuery
    ? activeVehicles.find(v => v.registrationNumber.toUpperCase() === cleanQuery)
    : null;

  const historicalMatches = cleanQuery
    ? historyRecords.filter(h => h.registrationNumber.toUpperCase() === cleanQuery && h.exitTimestamp !== null)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Parking Analytics & Intelligent Navigation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
              1D/2D Array Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic occupancy calculation, category-aware floor recommendation, tie resolution, and vehicle session inspection.
          </p>
        </div>
      </div>

      {/* Vehicle Location & Historical Sessions Lookup */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Vehicle Session Lookup</h3>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value.toUpperCase())}
              placeholder="Enter exact vehicle registration (e.g. TN-58-VIP-0001 or TN-58-PAST-101)..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {searchReg && (
            <button
              onClick={() => setSearchReg('')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {cleanQuery && (
          <div className="pt-2 space-y-3">
            {/* Active Status */}
            {activeMatch ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-950">
                      {activeMatch.registrationNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                      Currently Parked
                    </span>
                  </div>
                  <div className="text-xs text-emerald-900 mt-1 flex items-center gap-3">
                    <span className="font-bold">
                      Location: Floor {activeMatch.floorNumber}, Slot {activeMatch.slotNumber}
                    </span>
                    <span>Type: {activeMatch.vehicleType} ({activeMatch.parkingCategory})</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Parked at: {new Date(activeMatch.entryTimestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Vehicle is not currently parked in any active slot.
              </div>
            )}

            {/* Historical Sessions */}
            {historicalMatches.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Past Completed Sessions ({historicalMatches.length})
                </span>
                <div className="space-y-1.5">
                  {historicalMatches.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          Floor {h.floorNumber}, Slot {h.slotNumber}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(h.entryTimestamp).toLocaleDateString()} &bull; Duration:{' '}
                          {h.parkingDurationMinutes} mins
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{h.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Best Floor Recommendation Engine */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-blue-300" />
            <div>
              <h3 className="text-base font-bold text-white">Intelligent Floor Recommendation</h3>
              <p className="text-xs text-blue-200">
                Calculates eligible availability per floor based on arriving vehicle category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-blue-200 font-semibold">Vehicle Category:</span>
            <select
              value={analyzedCategory}
              onChange={(e) => setAnalyzedCategory(e.target.value as ParkingCategory)}
              className="px-3 py-1.5 rounded-lg bg-blue-800 text-white text-xs font-bold border border-blue-600 focus:outline-hidden"
            >
              <option value="Normal">Normal Vehicle</option>
              <option value="VIP">VIP Vehicle</option>
              <option value="Electric Vehicle">Electric Vehicle</option>
              <option value="Disabled">Disabled Access</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 block">
              Algorithmic Recommendation Result:
            </span>
            <div className="text-xl font-black text-white mt-0.5">
              {bestFloorRecommendation.bestFloor
                ? `Direct Arriving Vehicle to Floor ${bestFloorRecommendation.bestFloor}`
                : 'No Compatible Slots Available'}
            </div>
            <p className="text-xs text-blue-100 mt-1">{bestFloorRecommendation.reason}</p>
          </div>

          {bestFloorRecommendation.bestFloor && (
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-center self-start sm:self-auto">
              <span className="text-2xl font-black block">{bestFloorRecommendation.compatibleSlots}</span>
              <span className="text-[10px] uppercase tracking-wider block">Eligible Slots</span>
            </div>
          )}
        </div>
      </div>

      {/* Extremes & Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maximum Available Slots Floor(s) with Tie Handling */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Maximum Available Slots
            </span>
            <span className="text-2xl font-black text-emerald-600">{extremes.maxAvailableCount}</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {extremes.maxAvailableFloors.length > 1
              ? `Floors ${extremes.maxAvailableFloors.join(', ')} (Tie Between ${extremes.maxAvailableFloors.length} Floors)`
              : `Floor ${extremes.maxAvailableFloors[0] || 'None'}`}
          </div>
          <p className="text-[11px] text-slate-500">
            Ties are handled gracefully by returning an array of all floors sharing the maximum available count.
          </p>
        </div>

        {/* Minimum Available Slots Floor(s) with Tie Handling */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Minimum Available Slots
            </span>
            <span className="text-2xl font-black text-rose-600">{extremes.minAvailableCount}</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {extremes.minAvailableFloors.length > 1
              ? `Floors ${extremes.minAvailableFloors.join(', ')} (Tie Between ${extremes.minAvailableFloors.length} Floors)`
              : `Floor ${extremes.minAvailableFloors[0] || 'None'}`}
          </div>
          <p className="text-[11px] text-slate-500">
            Floors with minimum availability are prioritized for off-peak maintenance or rerouting.
          </p>
        </div>
      </div>

      {/* Mathematical Formulas Used */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span>Formulas Implemented per Specification:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Overall Occupancy Percentage:</span>
            <div className="font-bold text-slate-900 mt-1">
              (Occupied Slots / Usable Slots) × 100 = ({totalOccupied} / {totalSlots - totalOutOfService}) × 100 ={' '}
              <strong className="text-blue-600">{overallOccupancyPercent}%</strong>
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Floor Occupancy Percentage:</span>
            <div className="font-bold text-slate-900 mt-1">
              (Occupied Usable Slots / Usable Slots on Floor) × 100
            </div>
          </div>
        </div>
      </div>

      {/* Floor-by-Floor Analysis Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Floor-Wise Metric Breakdown</h3>
          <span className="text-xs text-slate-500 font-mono">5 Floors &bull; 50 Slots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Total Slots</th>
                <th className="py-3 px-4">Occupied (1)</th>
                <th className="py-3 px-4">Available (0)</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Out of Service</th>
                <th className="py-3 px-4">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {floorStats.map((fs) => (
                <tr key={fs.floorNumber} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">Floor {fs.floorNumber}</td>
                  <td className="py-3 px-4 font-mono">{fs.totalSlots}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">{fs.occupiedSlots}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">{fs.availableSlots}</td>
                  <td className="py-3 px-4 font-mono text-amber-600">{fs.reservedSlots}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{fs.outOfServiceSlots}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${fs.occupancyPercentage}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{fs.occupancyPercentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
