import React, { useState, useEffect } from 'react';
import { Search, X, Car, History, MapPin, Clock } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToExit?: (regNo: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigateToExit }) => {
  const { activeVehicles, historyRecords } = useParking();
  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toUpperCase();

  // Active matches (from active singly linked list snapshot)
  const activeMatches = cleanQuery
    ? activeVehicles.filter(
        v =>
          v.registrationNumber.toUpperCase().includes(cleanQuery) ||
          v.ownerName?.toUpperCase().includes(cleanQuery) ||
          `F${v.floorNumber}`.toUpperCase() === cleanQuery ||
          `S${v.slotNumber}`.toUpperCase() === cleanQuery ||
          `F${v.floorNumber}-S${v.slotNumber}`.toUpperCase() === cleanQuery ||
          v.floorNumber.toString() === cleanQuery
      )
    : [];

  // Historical matches (completed sessions only, so active aren't duplicated confusingly)
  const completedHistoryMatches = cleanQuery
    ? historyRecords.filter(
        h =>
          h.exitTimestamp !== null &&
          (h.registrationNumber.toUpperCase().includes(cleanQuery) ||
            h.ownerName?.toUpperCase().includes(cleanQuery) ||
            `F${h.floorNumber}`.toUpperCase() === cleanQuery ||
            h.floorNumber.toString() === cleanQuery)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by registration (e.g., TN-58), owner name, floor (e.g. 1), or slot..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-1 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Global Vehicle & Slot Search</p>
              <p className="text-xs text-slate-400 mt-1">
                Type a registration number, owner name, or floor number to search across active vehicles & historical sessions.
              </p>
            </div>
          )}

          {query && (
            <>
              {/* Section 1: Active Currently Parked Vehicles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    Currently Parked Vehicles ({activeMatches.length})
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                    Singly Linked List
                  </span>
                </div>

                {activeMatches.length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-500 border border-slate-200 text-center">
                    No active vehicles matching "{query}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeMatches.map((v) => (
                      <div
                        key={v.registrationNumber}
                        className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between hover:bg-blue-50 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-blue-950">
                              {v.registrationNumber}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {v.vehicleType} • {v.parkingCategory}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              Floor {v.floorNumber}, Slot {v.slotNumber}
                            </span>
                            {v.ownerName && <span>Owner: {v.ownerName}</span>}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Parked since: {new Date(v.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {onNavigateToExit && (
                          <button
                            onClick={() => {
                              onNavigateToExit(v.registrationNumber);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            Exit Vehicle
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Historical Completed Parking Sessions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    Past Parking Sessions ({completedHistoryMatches.length})
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                    History Linked List
                  </span>
                </div>

                {completedHistoryMatches.length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-500 border border-slate-200 text-center">
                    No past sessions matching "{query}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedHistoryMatches.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {h.registrationNumber}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Completed Session
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                            <span>Parked on Floor {h.floorNumber}, Slot {h.slotNumber}</span>
                            {h.parkingDurationMinutes && (
                              <span className="font-medium text-emerald-700">
                                Duration: {h.parkingDurationMinutes} mins
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Exited: {h.exitTimestamp ? new Date(h.exitTimestamp).toLocaleString() : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
