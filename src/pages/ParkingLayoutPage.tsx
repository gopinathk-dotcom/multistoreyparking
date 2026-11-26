import React, { useState } from 'react';
import {
  Layers,
  Info,
  Car,
  Filter,
  CheckCircle2,
  AlertCircle,
  Crown,
  Zap,
  Accessibility,
  AlertOctagon,
  LogOut,
  LogIn,
  Settings2,
  X
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { SlotCard } from '../components/SlotCard';
import { ActiveVehicleNodeData, SlotCategory } from '../types';
import { TOTAL_FLOORS, SLOTS_PER_FLOOR } from '../dataStructures/Array2D';
import { NavPage } from '../components/Sidebar';

interface ParkingLayoutPageProps {
  onNavigate: (page: NavPage, params?: any) => void;
}

export const ParkingLayoutPage: React.FC<ParkingLayoutPageProps> = ({ onNavigate }) => {
  const {
    occupancyMatrix,
    slotCategories,
    availableCounts,
    activeVehicles,
    updateSlotCategory,
    showConfirmDialog,
    exitVehicle
  } = useParking();

  const [selectedFloor, setSelectedFloor] = useState<number>(0); // 0 = All floors
  const [activeSlotModal, setActiveSlotModal] = useState<{
    floor: number;
    slot: number;
  } | null>(null);

  // Helper to find vehicle parked at (floor, slot)
  const getVehicleAt = (floor: number, slot: number): ActiveVehicleNodeData | undefined => {
    return activeVehicles.find(v => v.floorNumber === floor && v.slotNumber === slot);
  };

  const handleSlotClick = (floor: number, slot: number) => {
    setActiveSlotModal({ floor, slot });
  };

  const floorsToRender =
    selectedFloor === 0
      ? Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1)
      : [selectedFloor];

  const selectedModalVehicle = activeSlotModal
    ? getVehicleAt(activeSlotModal.floor, activeSlotModal.slot)
    : undefined;

  const isModalSlotOccupied = activeSlotModal
    ? occupancyMatrix[activeSlotModal.floor - 1]?.[activeSlotModal.slot - 1] === 1
    : false;

  const modalSlotCategory = activeSlotModal
    ? slotCategories[activeSlotModal.floor - 1]?.[activeSlotModal.slot - 1] || 'Normal'
    : 'Normal';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Interactive Multi-Storey Parking Grid
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              5 Floors &bull; 50 Slots
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual inspection of all 5 floors and 50 slots. Click any slot to view node details, trigger exits, or alter reservations.
          </p>
        </div>

        {/* Floor Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSelectedFloor(0)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedFloor === 0 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Floors
          </button>
          {[1, 2, 3, 4, 5].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedFloor === f ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl backdrop-blur-md">
        <span className="font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-400" />
          Slot Status Legend:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span className="text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500"></span>
            <span className="text-slate-300">VIP Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500"></span>
            <span className="text-slate-300">EV Charging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span className="text-slate-300">Disabled Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-500"></span>
            <span className="text-slate-400">Out of Service</span>
          </div>
        </div>
      </div>

      {/* Floors Display */}
      <div className="space-y-6">
        {floorsToRender.map((floorNum) => {
          const floorIndex = floorNum - 1;
          const availableInFloor = availableCounts[floorIndex] ?? 0;
          const isFloorFull = availableInFloor === 0;

          return (
            <div
              key={floorNum}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md transition hover:border-slate-700"
            >
              {/* Floor Header & Available Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    F{floorNum}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Floor {floorNum}</span>
                      {isFloorFull && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
                          Floor Full
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Row index: <code className="font-mono text-blue-400 font-semibold">parking[{floorIndex}]</code>
                    </p>
                  </div>
                </div>

                {/* 1D Array Available Slot Indicator */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      availableSlotsPerFloor[{floorIndex}]
                    </span>
                    <span className={`text-sm font-bold font-mono ${availableInFloor > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {availableInFloor} / {SLOTS_PER_FLOOR} Available
                    </span>
                  </div>
                </div>
              </div>

              {/* 10 Slot Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {Array.from({ length: SLOTS_PER_FLOOR }, (_, slotIdx) => {
                  const slotNum = slotIdx + 1;
                  const isOcc = occupancyMatrix[floorIndex]?.[slotIdx] === 1;
                  const cat = slotCategories[floorIndex]?.[slotIdx] || 'Normal';
                  const vehicle = getVehicleAt(floorNum, slotNum);

                  return (
                    <SlotCard
                      key={slotNum}
                      floorNumber={floorNum}
                      slotNumber={slotNum}
                      isOccupied={isOcc}
                      category={cat}
                      vehicle={vehicle}
                      onClick={() => handleSlotClick(floorNum, slotNum)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot Details & Action Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden transform animate-in fade-in duration-150 text-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
                  F{activeSlotModal.floor}-S{activeSlotModal.slot}
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Slot Inspector: Floor {activeSlotModal.floor}, Slot {activeSlotModal.slot}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    parking[{activeSlotModal.floor - 1}][{activeSlotModal.slot - 1}]
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Status & Category */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Occupancy Status</span>
                  <div className="mt-0.5 flex items-center gap-1.5 font-bold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isModalSlotOccupied ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    ></span>
                    <span className={isModalSlotOccupied ? 'text-rose-400' : 'text-emerald-400'}>
                      {isModalSlotOccupied ? 'Occupied (Value: 1)' : 'Empty (Value: 0)'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Slot Category</span>
                  <div className="mt-0.5 font-bold text-white">{modalSlotCategory}</div>
                </div>
              </div>

              {/* If occupied, show parked vehicle info */}
              {isModalSlotOccupied && selectedModalVehicle ? (
                <div className="border border-rose-500/30 bg-rose-950/30 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-rose-400" />
                    Parked Vehicle Details (Stored in Database)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registration</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {selectedModalVehicle.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vehicle / Category</span>
                      <span className="font-medium text-slate-200">
                        {selectedModalVehicle.vehicleType} • {selectedModalVehicle.parkingCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Owner Name</span>
                      <span className="font-medium text-slate-200">
                        {selectedModalVehicle.ownerName || 'Not recorded'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Entry Timestamp</span>
                      <span className="font-medium text-slate-200">
                        {new Date(selectedModalVehicle.entryTimestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const reg = selectedModalVehicle.registrationNumber;
                        setActiveSlotModal(null);
                        showConfirmDialog({
                          title: 'Confirm Vehicle Exit',
                          message: `Are you sure you want to process exit for vehicle ${reg} from Floor ${activeSlotModal.floor}, Slot ${activeSlotModal.slot}?`,
                          confirmLabel: 'Process Exit',
                          isDestructive: true,
                          onConfirm: () => exitVehicle(reg)
                        });
                      }}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Process Exit for this Vehicle</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Vacant slot actions: change category or park */
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    This slot is currently empty and eligible for allocation.
                  </div>

                  {/* Change category */}
                  <div className="border border-slate-800 rounded-xl p-3 bg-slate-950">
                    <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                      Configure Slot Category:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Normal', 'VIP', 'Electric Vehicle', 'Disabled', 'Out of Service'] as SlotCategory[]).map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              updateSlotCategory(activeSlotModal.floor, activeSlotModal.slot, cat);
                            }}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-left transition cursor-pointer ${
                              modalSlotCategory === cat
                                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSlotModal(null);
                      onNavigate('entry');
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Park a Vehicle Here</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setActiveSlotModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
