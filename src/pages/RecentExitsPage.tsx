import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Clock,
  Car,
  AlertCircle,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ExitRecord } from '../types';
import { Stack } from '../dataStructures/Stack';

export const RecentExitsPage: React.FC = () => {
  const { recentExits, recentExitsStack } = useParking();

  // Educational Demonstration Stack Sandbox (independent clone so pop() doesn't alter permanent records)
  const [demoStack, setDemoStack] = useState<Stack<ExitRecord>>(() => recentExitsStack.clone());
  const [demoStackItems, setDemoStackItems] = useState<ExitRecord[]>(() => demoStack.toArray());
  const [peekedItem, setPeekedItem] = useState<ExitRecord | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string>('Stack initialized from live exit stream.');

  // Demo Sandbox Input
  const [simulatedPlate, setSimulatedPlate] = useState('TN-58-DEMO-99');

  const handleDemoPop = () => {
    if (demoStack.isEmpty()) {
      setLastActionMessage('Stack Underflow: Cannot pop() from an empty stack!');
      return;
    }
    const popped = demoStack.pop();
    setDemoStackItems(demoStack.toArray());
    setPeekedItem(null);
    setLastActionMessage(`pop() executed: Removed top element "${popped?.registrationNumber}" (LIFO). Permanent history remains unaffected.`);
  };

  const handleDemoPeek = () => {
    if (demoStack.isEmpty()) {
      setLastActionMessage('Stack is empty. peek() returned null.');
      setPeekedItem(null);
      return;
    }
    const top = demoStack.peek();
    setPeekedItem(top);
    setLastActionMessage(`peek() executed: Top element is "${top?.registrationNumber}" at topNode.`);
  };

  const handleDemoPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedPlate.trim()) return;

    const fakeExit: ExitRecord = {
      id: `DEMO-EXIT-${Date.now()}`,
      registrationNumber: simulatedPlate.trim().toUpperCase(),
      vehicleType: 'Car',
      parkingCategory: 'Normal',
      floorNumber: 2,
      slotNumber: 5,
      entryTimestamp: new Date(Date.now() - 3600000).toISOString(),
      exitTimestamp: new Date().toISOString(),
      parkingDurationMinutes: 60,
      reallocatedToWaitingVehicle: null
    };

    demoStack.push(fakeExit);
    setDemoStackItems(demoStack.toArray());
    setLastActionMessage(`push("${fakeExit.registrationNumber}") executed: Added element to top of stack.`);
    setSimulatedPlate(`TN-58-DEMO-${Math.floor(10 + Math.random() * 89)}`);
  };

  const handleResetDemoStack = () => {
    const freshClone = recentExitsStack.clone();
    setDemoStack(freshClone);
    setDemoStackItems(freshClone.toArray());
    setPeekedItem(null);
    setLastActionMessage('Sandbox stack re-synchronized with live transaction exits.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Recent Vehicle Exits
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Stack (LIFO - Last In, First Out)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Whenever a vehicle exits, a snapshot record is pushed onto the stack. The most recent exit is always at the top.
          </p>
        </div>

        {/* Stack Top & Size Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Top Element:</span>
            <span className="font-mono font-bold">
              {recentExits.length > 0 ? recentExits[0].registrationNumber : 'Empty'}
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Size:</span>
            <span className="font-mono font-bold">{recentExits.length} Records</span>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration Panel for Viva / Lab */}
      <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Educational Stack Demonstration Sandbox
              </h3>
              <p className="text-[11px] text-slate-400">
                Interactive Push, Pop, Peek operations. Modifying this sandbox will <strong className="text-purple-300">not</strong> affect the permanent parking history database.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDemoStack}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sandbox to Live Data</span>
          </button>
        </div>

        {/* Sandbox Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Push Form */}
          <form onSubmit={handleDemoPush} className="flex items-center gap-2 flex-1 min-w-[260px]">
            <input
              type="text"
              value={simulatedPlate}
              onChange={(e) => setSimulatedPlate(e.target.value.toUpperCase())}
              placeholder="e.g. TN-58-DEMO"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-400 uppercase flex-1"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>push(x) &mdash; O(1)</span>
            </button>
          </form>

          {/* Pop Button */}
          <button
            onClick={handleDemoPop}
            className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>pop() &mdash; O(1)</span>
          </button>

          {/* Peek Button */}
          <button
            onClick={handleDemoPeek}
            className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>peek() &mdash; O(1)</span>
          </button>
        </div>

        {/* Action Status Output */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            <span>Console Log: {lastActionMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400">Sandbox Size: {demoStackItems.length}</span>
        </div>

        {/* Peek Details if peeked */}
        {peekedItem && (
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-xs flex items-center justify-between text-purple-200">
            <div>
              <span className="font-bold text-[10px] uppercase tracking-wider block text-purple-400">
                Current Top Element (peeked):
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {peekedItem.registrationNumber}
              </span>
              <span className="ml-2 text-slate-300">
                (Floor {peekedItem.floorNumber}, Slot {peekedItem.slotNumber} &bull; {peekedItem.parkingDurationMinutes} mins)
              </span>
            </div>
            <button
              onClick={() => setPeekedItem(null)}
              className="text-xs text-purple-300 hover:text-white"
            >
              Clear Peek
            </button>
          </div>
        )}

        {/* Visual Stack Chamber (Top to Bottom) */}
        <div className="pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Stack Chamber Visualization (Top &darr; Bottom):</span>
            <span className="text-purple-400 font-mono text-[10px]">topNode &rarr; LIFO order</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {demoStackItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl text-xs">
                Stack is currently empty (topNode == NULL)
              </div>
            ) : (
              demoStackItems.map((item, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between font-mono text-xs transition ${
                      isTop
                        ? 'bg-purple-900/60 border-purple-500 text-purple-100 ring-1 ring-purple-400'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isTop ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {isTop ? 'TOP' : `[${demoStackItems.length - 1 - idx}]`}
                      </span>
                      <span className="font-bold">{item.registrationNumber}</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        F{item.floorNumber}-S{item.slotNumber} &bull; {item.vehicleType}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-sans">
                      {item.parkingDurationMinutes} min duration
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Live Transaction Recent Exits List (Displaying permanent records) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Transaction Exits Stack</h3>
            <p className="text-xs text-slate-500">Chronological LIFO order maintained directly from actual exit transactions</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
            Stack.display()
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Stack Index</th>
                <th className="py-2.5 px-4">Vehicle Registration</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Vacated Slot</th>
                <th className="py-2.5 px-4">Exit Timestamp</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4">Reallocated To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentExits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No recent exits recorded yet.
                  </td>
                </tr>
              ) : (
                recentExits.map((item, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition ${isTop ? 'bg-purple-50/40' : ''}`}>
                      <td className="py-3 px-4 font-mono">
                        {isTop ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                            TOP
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.registrationNumber}
                      </td>
                      <td className="py-3 px-4">
                        {item.vehicleType} • {item.parkingCategory}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        Floor {item.floorNumber}, Slot {item.slotNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(item.exitTimestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {item.parkingDurationMinutes} mins
                      </td>
                      <td className="py-3 px-4">
                        {item.reallocatedToWaitingVehicle ? (
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {item.reallocatedToWaitingVehicle}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None (Made Free)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
