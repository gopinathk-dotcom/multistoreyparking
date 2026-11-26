import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  LogIn,
  LogOut,
  Car,
  History,
  Users,
  Layers,
  ShieldAlert,
  BarChart3,
  Binary,
  Settings
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export type NavPage =
  | 'dashboard'
  | 'layout'
  | 'entry'
  | 'exit'
  | 'active'
  | 'history'
  | 'queue'
  | 'stack'
  | 'reserved'
  | 'analysis'
  | 'dslab'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const { activeVehicles, waitingVehicles, recentExits, historyRecords } = useParking();

  const navItems: {
    id: NavPage;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    dsTag: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      dsTag: 'Summary'
    },
    {
      id: 'layout',
      label: 'Parking Layout',
      icon: Grid3X3,
      dsTag: '2D Array'
    },
    {
      id: 'entry',
      label: 'Vehicle Entry',
      icon: LogIn,
      dsTag: 'Allocation'
    },
    {
      id: 'exit',
      label: 'Vehicle Exit',
      icon: LogOut,
      dsTag: 'Reallocate'
    },
    {
      id: 'active',
      label: 'Active Vehicles',
      icon: Car,
      badge: activeVehicles.length,
      badgeColor: 'bg-blue-100 text-blue-700',
      dsTag: 'Singly LL'
    },
    {
      id: 'history',
      label: 'Parking History',
      icon: History,
      badge: historyRecords.length,
      badgeColor: 'bg-slate-100 text-slate-700',
      dsTag: 'Linked List'
    },
    {
      id: 'queue',
      label: 'Waiting Queue',
      icon: Users,
      badge: waitingVehicles.length,
      badgeColor: waitingVehicles.length > 0 ? 'bg-amber-100 text-amber-700' : undefined,
      dsTag: 'FIFO Queue'
    },
    {
      id: 'stack',
      label: 'Recent Exits Stack',
      icon: Layers,
      badge: recentExits.length,
      badgeColor: 'bg-purple-100 text-purple-700',
      dsTag: 'LIFO Stack'
    },
    {
      id: 'reserved',
      label: 'Reserved Slots',
      icon: ShieldAlert,
      dsTag: 'Slot List'
    },
    {
      id: 'analysis',
      label: 'Parking Analysis',
      icon: BarChart3,
      dsTag: '1D/2D Metrics'
    },
    {
      id: 'dslab',
      label: 'Data Structures Lab',
      icon: Binary,
      badge: 'Interactive',
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
      dsTag: 'Learning Hub'
    },
    {
      id: 'settings',
      label: 'Settings & Storage',
      icon: Settings,
      dsTag: 'LocalStorage'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-[calc(100vh-61px)]">
      {/* Category Section: Core Operations */}
      <div className="p-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Operations & Management Modules
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive ? 'bg-blue-500 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${
                    isActive ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.dsTag}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info: TCE Madurai Info */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 text-xs">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Database Storage: Live</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          5 Floors • 50 Slots • Multi-Storey Facility
        </p>
      </div>
    </aside>
  );
};
