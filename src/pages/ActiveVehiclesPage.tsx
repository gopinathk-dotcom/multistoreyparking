import React, { useState } from 'react';
import {
  Car,
  Search,
  Filter,
  LogOut,
  MapPin,
  ArrowRight,
  ExternalLink,
  Code2,
  Binary,
  Database
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { NavPage } from '../components/Sidebar';
import { ParkingCategory, VehicleType } from '../types';

interface ActiveVehiclesPageProps {
  onNavigate: (page: NavPage, params?: any) => void;
}

export const ActiveVehiclesPage: React.FC<ActiveVehiclesPageProps> = ({ onNavigate }) => {
  const { activeVehicles, showConfirmDialog, exitVehicle } = useParking();

  const [search, setSearch] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number>(0); // 0 = all
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showNodeChain, setShowNodeChain] = useState<boolean>(true);

  const cleanQuery = search.trim().toUpperCase();

  // Filter active vehicles
  const filteredVehicles = activeVehicles.filter((v) => {
    if (selectedFloor !== 0 && v.floorNumber !== selectedFloor) return false;
    if (selectedCategory !== 'all' && v.parkingCategory !== selectedCategory) return false;
    if (selectedType !== 'all' && v.vehicleType !== selectedType) return false;
    if (cleanQuery) {
      const matchReg = v.registrationNumber.toUpperCase().includes(cleanQuery);
      const matchOwner = v.ownerName?.toUpperCase().includes(cleanQuery) ?? false;
      if (!matchReg && !matchOwner) return false;
    }
    return true;
  });

  const handleExit = (regNo: string, floor: number, slot: number) => {
    showConfirmDialog({
      title: 'Confirm Exit',
      message: `Process exit for ${regNo} from Floor ${floor}, Slot ${slot}?`,
      confirmLabel: 'Process Exit',
      isDestructive: true,
      onConfirm: () => exitVehicle(regNo)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Active Parked Vehicles
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {activeVehicles.length} Vehicles Parked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic in-memory pool storing active vehicle nodes, synchronized with the persistent database repository.
          </p>
        </div>

        <button
          onClick={() => setShowNodeChain(!showNodeChain)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto cursor-pointer border border-slate-700"
        >
          <Binary className="w-3.5 h-3.5 text-blue-400" />
          <span>{showNodeChain ? 'Hide Node Diagram' : 'Show Node Diagram'}</span>
        </button>
      </div>

      {/* Visual Node Chain Diagram */}
      {showNodeChain && (
        <div className="bg-slate-900/90 rounded-2xl p-5 text-white shadow-xl border border-slate-800 space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Linked List Memory Traversal Chain (Head &rarr; Tail &rarr; NULL)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              head = {activeVehicles.length > 0 ? `ActiveVehicleNode("${activeVehicles[0].registrationNumber}")` : 'null'}
            </span>
          </div>

          <div className="overflow-x-auto pb-2 pt-1 flex items-center gap-2 text-xs font-mono">
            {/* HEAD Label */}
            <div className="shrink-0 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] shadow-sm">
              HEAD
            </div>

            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />

            {activeVehicles.length === 0 ? (
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400 text-xs">
                List is empty (head == NULL)
              </div>
            ) : (
              activeVehicles.map((v, idx) => (
                <React.Fragment key={v.registrationNumber}>
                  <div className="shrink-0 p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex flex-col gap-1 min-w-[170px] shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Node #{idx + 1}</span>
                      <span className="text-blue-400 font-bold">F{v.floorNumber}-S{v.slotNumber}</span>
                    </div>
                    <span className="font-bold text-slate-100 text-xs">{v.registrationNumber}</span>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-1 mt-0.5">
                      <span>{v.parkingCategory}</span>
                      <span className="text-emerald-400 font-mono text-[9px]">.next &rarr;</span>
                    </div>
                  </div>

                  {idx < activeVehicles.length - 1 ? (
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              ))
            )}

            {/* NULL Terminator */}
            <div className="shrink-0 px-2.5 py-1.5 bg-rose-950 text-rose-300 border border-rose-800/60 rounded-lg font-bold text-[11px]">
              NULL
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active vehicles..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Floor Filter */}
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(Number(e.target.value))}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white"
        >
          <option value={0}>All Floors (1 - 5)</option>
          <option value={1}>Floor 1</option>
          <option value={2}>Floor 2</option>
          <option value={3}>Floor 3</option>
          <option value={4}>Floor 4</option>
          <option value={5}>Floor 5</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white"
        >
          <option value="all">All Categories</option>
          <option value="Normal">Normal</option>
          <option value="VIP">VIP</option>
          <option value="Electric Vehicle">Electric Vehicle</option>
          <option value="Disabled">Disabled</option>
        </select>

        {/* Vehicle Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white"
        >
          <option value="all">All Vehicle Types</option>
          <option value="Car">Car</option>
          <option value="Motorcycle">Motorcycle</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Active Vehicles Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Vehicle Registration</th>
                <th className="py-3 px-4">Type & Category</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Floor & Slot</th>
                <th className="py-3 px-4">Parked Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No active parked vehicles matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v, index) => (
                  <tr key={v.registrationNumber} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-xs">
                        {v.registrationNumber}
                      </div>
                      {v.contactNumber && (
                        <div className="text-[10px] text-slate-400">{v.contactNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-300">{v.vehicleType}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {v.parkingCategory}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {v.ownerName || <span className="text-slate-500 italic">Not registered</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      Floor {v.floorNumber}, Slot {v.slotNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(v.entryTimestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleExit(v.registrationNumber, v.floorNumber, v.slotNumber)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Exit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredVehicles.length} of {activeVehicles.length} active vehicles in database</span>
          <span className="font-mono text-[11px] text-slate-500">Database Record Count: {activeVehicles.length}</span>
        </div>
      </div>
    </div>
  );
};
