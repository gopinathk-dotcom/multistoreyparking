import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowRight,
  Eye,
  Trash2,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Info
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ParkingCategory, VehicleType, WaitingVehicle } from '../types';

export const WaitingQueuePage: React.FC = () => {
  const {
    waitingVehicles,
    waitingQueue,
    enqueueWaitingVehicle,
    cancelWaitingVehicle,
    dequeueManual
  } = useParking();

  const [regNo, setRegNo] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [parkingCategory, setParkingCategory] = useState<ParkingCategory>('Normal');
  const [ownerName, setOwnerName] = useState('');
  const [peekedVehicle, setPeekedVehicle] = useState<WaitingVehicle | null>(null);

  const handleEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;

    enqueueWaitingVehicle({
      registrationNumber: regNo,
      vehicleType,
      parkingCategory,
      ownerName: ownerName || undefined
    });

    setRegNo('');
    setOwnerName('');
  };

  const handlePeek = () => {
    const front = waitingQueue.peek();
    setPeekedVehicle(front);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Waiting Vehicles Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
              FIFO (Front & Rear Pointers)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linked-node FIFO Queue with dedicated frontNode and rearNode references. First vehicle to arrive is first to be offered an eligible parking slot.
          </p>
        </div>

        {/* Demo Operations Panel: Peek & Dequeue */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePeek}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Inspect Front Vehicle without dequeuing"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Peek() Front</span>
          </button>
          <button
            onClick={() => dequeueManual()}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Dequeue front element manually"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Dequeue() Front</span>
          </button>
        </div>
      </div>

      {/* Peek Result Banner */}
      {peekedVehicle && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <div className="text-xs">
              <span className="font-bold text-blue-900 block uppercase tracking-wider text-[10px]">
                Peek() Result &mdash; Front Node in Memory:
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {peekedVehicle.registrationNumber}
              </span>
              <span className="text-slate-600 ml-2">
                ({peekedVehicle.vehicleType} &bull; {peekedVehicle.parkingCategory})
              </span>
            </div>
          </div>
          <button
            onClick={() => setPeekedVehicle(null)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Visual Queue Pipeline: FRONT -> REAR */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              FIFO Queue Structure (FRONT Pointer &rarr; REAR Pointer)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Queue Size: {waitingVehicles.length}
          </span>
        </div>

        <div className="overflow-x-auto pb-2 pt-1 flex items-center gap-2 text-xs font-mono">
          {/* FRONT Pointer Badge */}
          <div className="shrink-0 px-2.5 py-1.5 bg-amber-500 text-slate-950 rounded-lg font-bold text-[11px] shadow-2xs">
            FRONT (Dequeue)
          </div>

          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />

          {waitingVehicles.length === 0 ? (
            <div className="px-4 py-3 bg-slate-800 rounded-lg text-slate-400 text-xs italic">
              Queue is empty. Front = Rear = null.
            </div>
          ) : (
            waitingVehicles.map((v, idx) => {
              const isFront = idx === 0;
              const isRear = idx === waitingVehicles.length - 1;

              return (
                <React.Fragment key={v.queueId}>
                  <div
                    className={`shrink-0 p-3 rounded-xl border flex flex-col gap-1 min-w-[180px] shadow-2xs transition ${
                      isFront
                        ? 'bg-amber-950/80 border-amber-500 text-amber-100 ring-2 ring-amber-500/30'
                        : isRear
                        ? 'bg-blue-950/80 border-blue-500 text-blue-100'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold">Position #{idx + 1}</span>
                      {isFront && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded text-[9px]">
                          FRONT
                        </span>
                      )}
                      {isRear && (
                        <span className="px-1.5 py-0.2 bg-blue-500 text-white font-bold rounded text-[9px]">
                          REAR
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs">{v.registrationNumber}</span>
                    <div className="text-[10px] opacity-80 flex items-center justify-between border-t border-white/10 pt-1 mt-0.5">
                      <span>{v.parkingCategory}</span>
                      <span>{v.vehicleType}</span>
                    </div>
                  </div>

                  {idx < waitingVehicles.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              );
            })
          )}

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* REAR Pointer Badge */}
          <div className="shrink-0 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] shadow-2xs">
            REAR (Enqueue)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enqueue Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Manual Enqueue Vehicle</h3>
          </div>

          <form onSubmit={handleEnqueue} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Registration Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                placeholder="e.g. TN-58-WQ-8899"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 uppercase text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={parkingCategory}
                  onChange={(e) => setParkingCategory(e.target.value as ParkingCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                  <option value="Electric Vehicle">Electric Vehicle</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Owner Name (Optional)
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. C. Venkatesh"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enqueue to Rear &mdash; O(1)</span>
              </button>
            </div>
          </form>

          {/* Policy explanation */}
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1 text-amber-950">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              Eligible-FIFO Reallocation Policy:
            </span>
            <p className="leading-relaxed">
              When a parking slot is vacated during exit, the system scans the queue in arrival order. If the front vehicle is category-incompatible with the freed slot (e.g. VIP slot freed while front vehicle is Normal), the front vehicle keeps its priority position, and the first eligible vehicle is safely promoted.
            </p>
          </div>
        </div>

        {/* Queue Items Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Current Queue State</h3>
            <span className="text-xs text-slate-500 font-mono">
              Count: {waitingVehicles.length}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-3">Registration</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Arrival Time</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {waitingVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No vehicles currently waiting in queue.
                    </td>
                  </tr>
                ) : (
                  waitingVehicles.map((v, idx) => (
                    <tr key={v.queueId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {v.registrationNumber}
                        {v.ownerName && (
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            {v.ownerName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {v.parkingCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(v.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => cancelWaitingVehicle(v.registrationNumber)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          Remove
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
