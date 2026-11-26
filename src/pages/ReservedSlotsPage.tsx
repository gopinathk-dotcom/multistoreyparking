import React, { useState } from 'react';
import {
  ShieldAlert,
  Crown,
  Zap,
  Accessibility,
  AlertOctagon,
  CheckCircle2,
  Info,
  Car,
  SlidersHorizontal
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { SlotCategory } from '../types';
import { SLOTS_PER_FLOOR, TOTAL_FLOORS } from '../dataStructures/Array2D';

export const ReservedSlotsPage: React.FC = () => {
  const {
    slotCategories,
    occupancyMatrix,
    updateSlotCategory,
    activeVehicles
  } = useParking();

  const [targetFloor, setTargetFloor] = useState<number>(1);
  const [targetSlot, setTargetSlot] = useState<number>(1);
  const [targetCategory, setTargetCategory] = useState<SlotCategory>('VIP');

  const currentCategory = slotCategories[targetFloor - 1]?.[targetSlot - 1] || 'Normal';
  const isOccupied = occupancyMatrix[targetFloor - 1]?.[targetSlot - 1] === 1;
  const occupyingVehicle = activeVehicles.find(
    v => v.floorNumber === targetFloor && v.slotNumber === targetSlot
  );

  const handleApplyReservation = (e: React.FormEvent) => {
    e.preventDefault();
    updateSlotCategory(targetFloor, targetSlot, targetCategory);
  };

  // Compile summary of all reserved slots across the building
  const reservedSlotsSummary: {
    floor: number;
    slot: number;
    category: SlotCategory;
    isOccupied: boolean;
    vehiclePlate?: string;
  }[] = [];

  for (let f = 0; f < TOTAL_FLOORS; f++) {
    for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
      const cat = slotCategories[f]?.[s] || 'Normal';
      if (cat !== 'Normal') {
        const occ = occupancyMatrix[f]?.[s] === 1;
        const v = activeVehicles.find(item => item.floorNumber === f + 1 && item.slotNumber === s + 1);
        reservedSlotsSummary.push({
          floor: f + 1,
          slot: s + 1,
          category: cat,
          isOccupied: occ,
          vehiclePlate: v?.registrationNumber
        });
      }
    }
  }

  const getCategoryIcon = (category: SlotCategory) => {
    switch (category) {
      case 'VIP':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'Electric Vehicle':
        return <Zap className="w-4 h-4 text-cyan-600" />;
      case 'Disabled':
        return <Accessibility className="w-4 h-4 text-amber-600" />;
      case 'Out of Service':
        return <AlertOctagon className="w-4 h-4 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Reserved & Special Parking Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Access Control & Slot Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure designated VIP, EV Charging, Accessible (Disabled), and Out of Service maintenance bays.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono font-bold self-start sm:self-auto">
          {reservedSlotsSummary.length} Special Slots Designated
        </div>
      </div>

      {/* Rules Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-blue-950 block">
            Reservation Integrity Constraints:
          </span>
          <p>
            • Normal vehicles are strictly prohibited from occupying reserved slots (VIP, EV, Disabled).
          </p>
          <p>
            • Reservation categories can <strong>only be modified when a slot is completely vacant</strong> (Occupancy Value = 0). Modifying an occupied slot is blocked to prevent invalidating active vehicles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reservation Assignment Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Configure Slot Category</h3>
          </div>

          <form onSubmit={handleApplyReservation} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Floor (1 - 5)
                </label>
                <select
                  value={targetFloor}
                  onChange={(e) => setTargetFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  {[1, 2, 3, 4, 5].map((f) => (
                    <option key={f} value={f}>
                      Floor {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Slot (1 - 10)
                </label>
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  {Array.from({ length: SLOTS_PER_FLOOR }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Slot {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Slot Status Inspector */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Coordinates:</span>
                <span className="font-mono font-bold text-slate-900">
                  Floor {targetFloor}, Slot {targetSlot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Category:</span>
                <span className="font-bold text-blue-700">{currentCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Occupancy:</span>
                <span className={`font-bold ${isOccupied ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isOccupied ? `Occupied (${occupyingVehicle?.registrationNumber})` : 'Empty (0)'}
                </span>
              </div>
            </div>

            {/* New Category Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign New Category
              </label>
              <div className="space-y-1.5">
                {(['Normal', 'VIP', 'Electric Vehicle', 'Disabled', 'Out of Service'] as SlotCategory[]).map(
                  (cat) => (
                    <label
                      key={cat}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
                        targetCategory === cat
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={targetCategory === cat}
                          onChange={() => setTargetCategory(cat)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{cat}</span>
                      </div>
                      {getCategoryIcon(cat)}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isOccupied}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 ${
                  isOccupied
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isOccupied ? 'Slot Occupied - Cannot Modify' : 'Update Slot Category'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Current Reserved Slots Directory (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Reserved & Special Slots</h3>
              <p className="text-xs text-slate-500">All non-normal slots across Floors 1 to 5</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
              {reservedSlotsSummary.length} Configured
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Current Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reservedSlotsSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No reserved slots configured. All slots are Normal.
                    </td>
                  </tr>
                ) : (
                  reservedSlotsSummary.map((item) => (
                    <tr key={`res-${item.floor}-${item.slot}`} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        Floor {item.floor}, Slot {item.slot}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.isOccupied ? (
                          <span className="font-mono text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Occupied ({item.vehiclePlate})
                          </span>
                        ) : item.category === 'Out of Service' ? (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            Maintenance
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Vacant & Reserved
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setTargetFloor(item.floor);
                            setTargetSlot(item.slot);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
