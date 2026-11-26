import React from 'react';
import { Car, Zap, Accessibility, Crown, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { ActiveVehicleNodeData, SlotCategory } from '../types';

interface SlotCardProps {
  floorNumber: number;
  slotNumber: number;
  isOccupied: boolean;
  category: SlotCategory;
  vehicle?: ActiveVehicleNodeData;
  onClick?: () => void;
  compact?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  floorNumber,
  slotNumber,
  isOccupied,
  category,
  vehicle,
  onClick,
  compact = false
}) => {
  // Determine styles & badges
  let statusBg = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-950/60 shadow-md shadow-emerald-950/30';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  let statusText = 'Available';

  if (category === 'Out of Service') {
    statusBg = 'bg-slate-900/50 border-slate-800 text-slate-400 opacity-60';
    badgeColor = 'bg-slate-800 text-slate-400 border border-slate-700';
    statusText = 'Out of Service';
  } else if (isOccupied) {
    statusBg = 'bg-rose-950/40 border-rose-500/50 text-rose-200 hover:border-rose-400 hover:bg-rose-950/60 shadow-md shadow-rose-950/30';
    badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    statusText = 'Occupied';
  } else if (category === 'VIP') {
    statusBg = 'bg-purple-950/40 border-purple-500/50 text-purple-200 hover:border-purple-400 hover:bg-purple-950/60 shadow-md shadow-purple-950/30';
    badgeColor = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    statusText = 'Reserved (VIP)';
  } else if (category === 'Electric Vehicle') {
    statusBg = 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-950/60 shadow-md shadow-cyan-950/30';
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    statusText = 'EV Charging';
  } else if (category === 'Disabled') {
    statusBg = 'bg-amber-950/40 border-amber-500/50 text-amber-200 hover:border-amber-400 hover:bg-amber-950/60 shadow-md shadow-amber-950/30';
    badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    statusText = 'Accessible';
  }

  const getCategoryIcon = () => {
    switch (category) {
      case 'VIP':
        return <Crown className="w-3.5 h-3.5 text-purple-600" />;
      case 'Electric Vehicle':
        return <Zap className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Disabled':
        return <Accessibility className="w-3.5 h-3.5 text-amber-600" />;
      case 'Out of Service':
        return <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        title={`Floor ${floorNumber}, Slot ${slotNumber} - ${statusText} ${vehicle ? `(${vehicle.registrationNumber})` : ''}`}
        className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${statusBg}`}
      >
        <span className="text-[10px] font-mono font-bold">S{slotNumber}</span>
        <div className="mt-0.5">
          {isOccupied ? (
            <Car className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            getCategoryIcon() || <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl border transition shadow-2xs cursor-pointer flex flex-col justify-between relative group ${statusBg}`}
    >
      {/* Header: Slot Number & Category Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-white shadow-xs">
            F{floorNumber} - S{slotNumber}
          </span>
          {getCategoryIcon()}
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {category !== 'Normal' ? category : statusText}
        </span>
      </div>

      {/* Main Content: Vehicle Info or Available State */}
      <div className="my-2.5 min-h-[48px] flex flex-col justify-center">
        {isOccupied && vehicle ? (
          <div>
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-mono font-bold text-xs text-rose-200 tracking-tight truncate">
                {vehicle.registrationNumber}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 truncate">
              {vehicle.ownerName ? vehicle.ownerName : `${vehicle.vehicleType} (${vehicle.parkingCategory})`}
            </div>
          </div>
        ) : category === 'Out of Service' ? (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <AlertOctagon className="w-4 h-4 text-slate-500" />
            <span>Unavailable (Maintenance)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vacant & Eligible</span>
          </div>
        )}
      </div>

      {/* Footer: 2D array coordinates */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>parking[{floorNumber - 1}][{slotNumber - 1}]</span>
        <span className="font-bold text-slate-300">{isOccupied ? 'val: 1' : 'val: 0'}</span>
      </div>
    </div>
  );
};
