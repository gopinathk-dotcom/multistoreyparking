import React from 'react';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Users,
  Percent,
  Award,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  LogIn,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useParking } from '../context/ParkingContext';
import { NavPage } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    totalSlots,
    totalOccupied,
    totalAvailable,
    totalReserved,
    overallOccupancyPercent,
    activeVehicles,
    waitingVehicles,
    totalServedCount,
    floorStats,
    grid,
    historyRecords
  } = useParking();

  // Find max and min available floors
  const extremes = grid.getExtremeFloors();

  // Data for floor-wise occupancy bar chart
  const barChartData = floorStats.map((fs) => ({
    name: `Floor ${fs.floorNumber}`,
    Occupied: fs.occupiedSlots,
    Available: fs.availableSlots,
    Reserved: fs.reservedSlots,
    rate: `${fs.occupancyPercentage}%`
  }));

  // Data for pie chart (Available vs Occupied vs Reserved vs Out-of-service)
  const pieData = [
    { name: 'Occupied', value: totalOccupied, color: '#ef4444' },
    { name: 'Available', value: totalAvailable, color: '#10b981' },
    { name: 'Reserved', value: totalReserved, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Recent combined activities (last 6 entries/exits)
  const recentActivities = historyRecords.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-2xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Car className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Department of Information Technology • Live Database & Operations</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Multi-Storey Parking Control Dashboard
          </h2>
          <p className="text-sm text-blue-200/90 mt-2 leading-relaxed">
            Real-time multi-floor parking allocation, automated slot reservations, and instant vehicle database synchronization.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('entry')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-blue-400 hover:to-indigo-500 transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Register & Enter Vehicle</span>
            </button>
            <button
              onClick={() => onNavigate('exit')}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/90 text-white text-xs font-bold rounded-xl transition border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Process Vehicle Exit</span>
            </button>
            <button
              onClick={() => onNavigate('layout')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/15 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Inspect 5-Floor Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Slots */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Slots</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Building2Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">{totalSlots}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            5 Floors × 10 Slots
          </div>
        </div>

        {/* Card 2: Occupied Slots */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupied Slots</span>
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-500/30">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">{totalOccupied}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Currently In-Use
          </div>
        </div>

        {/* Card 3: Available Slots */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Slots</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{totalAvailable}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Vacant & Ready
          </div>
        </div>

        {/* Card 4: Reserved Slots */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reserved Slots</span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{totalReserved}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            VIP, EV, Disabled
          </div>
        </div>

        {/* Card 5: Parked Vehicles */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-blue-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Parked Vehicles</span>
            <div className="p-2 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-500/30">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-400">{activeVehicles.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Stored in Database
          </div>
        </div>

        {/* Card 6: Waiting Queue */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Waiting Queue</span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{waitingVehicles.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Priority Queue
          </div>
        </div>

        {/* Card 7: Overall Occupancy */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupancy Rate</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">{overallOccupancyPercent}%</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalOccupied} / {totalSlots - totalReserved} usable
          </div>
        </div>

        {/* Card 8: Total Vehicles Served */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-indigo-500/30 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Served</span>
            <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-400">{totalServedCount}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Historical Records
          </div>
        </div>
      </div>

      {/* Extremes Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Floor with Maximum Availability
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {extremes.maxAvailableFloors.length > 1
                  ? `Floors ${extremes.maxAvailableFloors.join(', ')} (Tie)`
                  : `Floor ${extremes.maxAvailableFloors[0] || 'None'}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{extremes.maxAvailableCount}</span>
            <span className="text-xs text-emerald-300/80 block">free slots</span>
          </div>
        </div>

        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Floor with Minimum Availability
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {extremes.minAvailableFloors.length > 1
                  ? `Floors ${extremes.minAvailableFloors.join(', ')} (Tie)`
                  : `Floor ${extremes.minAvailableFloors[0] || 'None'}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-rose-400">{extremes.minAvailableCount}</span>
            <span className="text-xs text-rose-300/80 block">free slots</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor-wise Occupancy Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Floor-wise Occupancy & Slot Allocation</h3>
              <p className="text-xs text-slate-400">Live 2D array occupancy mapped across Floors 1 to 5</p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              parking[5][10]
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Occupied" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Reserved" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Distribution Pie Chart (1 col) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Occupancy Distribution</h3>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                Ratio
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Available vs Occupied vs Reserved</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Occupied</span>
              <span className="text-sm font-bold text-rose-400">{totalOccupied}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Available</span>
              <span className="text-sm font-bold text-emerald-400">{totalAvailable}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Reserved</span>
              <span className="text-sm font-bold text-amber-400">{totalReserved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vehicle Activity */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Vehicle Entry & Exit Activity</h3>
            <p className="text-xs text-slate-400">Live database audit ledger stream</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {recentActivities.map((act) => {
            const isParked = act.exitTimestamp === null;
            return (
              <div key={act.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isParked ? 'bg-blue-950 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isParked ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">
                        {act.registrationNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {act.vehicleType} • {act.parkingCategory}
                      </span>
                      {isParked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                          Currently Parked
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Exited ({act.parkingDurationMinutes} mins)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Floor {act.floorNumber}, Slot {act.slotNumber} • Entry:{' '}
                      {new Date(act.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    F{act.floorNumber}-S{act.slotNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
