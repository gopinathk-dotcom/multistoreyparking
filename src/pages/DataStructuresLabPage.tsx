import React, { useState } from 'react';
import {
  Binary,
  Code2,
  Play,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Layers,
  Users,
  Grid3X3,
  List,
  History,
  Car
} from 'lucide-react';

type DSTab = '1darray' | '2darray' | 'list' | 'singlyll' | 'historyll' | 'stack' | 'queue';

export const DataStructuresLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DSTab>('2darray');

  // Interactive Sandboxes State
  // 1. Array Indexing Sandbox
  const [array1DSandbox, setArray1DSandbox] = useState<number[]>([7, 8, 9, 10, 8]);
  const [sandbox1DIndex, setSandbox1DIndex] = useState<number>(0);
  const [sandbox1DResult, setSandbox1DResult] = useState<string>('availableSlotsPerFloor[0] = 7');

  // 2. 2D Array Sandbox
  const [matrix2D, setMatrix2D] = useState<number[][]>([
    [1, 1, 0, 0, 1],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ]);
  const [selectedF, setSelectedF] = useState<number>(0);
  const [selectedS, setSelectedS] = useState<number>(0);

  // 3. Singly Linked List Sandbox
  const [llNodes, setLlNodes] = useState<string[]>(['TN-58-A-100', 'TN-58-B-200', 'TN-58-C-300']);
  const [llInput, setLlInput] = useState<string>('TN-58-D-400');
  const [llMsg, setLlMsg] = useState<string>('Linked list initialized with 3 nodes.');

  // 4. Stack Sandbox
  const [stackItems, setStackItems] = useState<string[]>(['TN-58-EXIT-1', 'TN-58-EXIT-2']);
  const [stackInput, setStackInput] = useState<string>('TN-58-EXIT-3');
  const [stackMsg, setStackMsg] = useState<string>('Stack initialized.');

  // 5. Queue Sandbox
  const [queueItems, setQueueItems] = useState<string[]>(['TN-58-WAIT-1', 'TN-58-WAIT-2']);
  const [queueInput, setQueueInput] = useState<string>('TN-58-WAIT-3');
  const [queueMsg, setQueueMsg] = useState<string>('Queue initialized.');

  const tabs: { id: DSTab; label: string; icon: React.ElementType }[] = [
    { id: '2darray', label: '2D Array (Occupancy Matrix)', icon: Grid3X3 },
    { id: '1darray', label: '1D Array (Available Counts)', icon: Binary },
    { id: 'singlyll', label: 'Singly Linked List (Active Vehicles)', icon: Car },
    { id: 'stack', label: 'Stack (Recent Exits - LIFO)', icon: Layers },
    { id: 'queue', label: 'Queue (Waiting Vehicles - FIFO)', icon: Users },
    { id: 'historyll', label: 'Linked List (Parking History)', icon: History },
    { id: 'list', label: 'List (Floor & Reservation Metadata)', icon: List }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Data Structures Learning Center & Interactive Lab
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              TCE IT Syllabus Alignment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explanations, algorithms, Big-O asymptotic analysis, source implementations, and interactive sandboxes for student viva demonstrations.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {/* ==================== 1. 2D ARRAY TAB ==================== */}
        {activeTab === '2darray' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">2D Array: Multi-Floor Occupancy Matrix</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Definition:</strong> A two-dimensional array is an array of arrays representing data in a grid consisting of rows and columns.
                </p>
                <p>
                  <strong>Role in Parking System:</strong> The parking facility is mapped directly into memory as <code className="font-mono text-blue-600">parking[floor][slot]</code>.
                  Each cell stores a binary value: <code className="font-mono text-emerald-600 font-bold">0 = Empty Slot</code> and <code className="font-mono text-rose-600 font-bold">1 = Occupied Slot</code>.
                </p>
                <p>
                  <strong>Direct Random Access:</strong> Because multidimensional arrays use contiguous row-major memory mapping, looking up any slot's status by its floor and slot number takes exact constant time <strong>O(1)</strong>:
                  <code className="block bg-slate-900 text-purple-300 p-2 rounded-lg font-mono mt-1 text-[11px]">
                    MemoryAddress = BaseAddress + (floor × SLOTS_PER_FLOOR + slot) × ElementSize
                  </code>
                </p>
              </div>

              {/* Complexity Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Operation</th>
                      <th className="py-2 px-3">Time Complexity</th>
                      <th className="py-2 px-3">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold">Direct Access [f][s]</td>
                      <td className="py-2 px-3 font-mono text-emerald-700 font-bold">O(1)</td>
                      <td className="py-2 px-3 text-slate-600">Direct indexing via row-major address calculation</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold">Update Slot Status</td>
                      <td className="py-2 px-3 font-mono text-emerald-700 font-bold">O(1)</td>
                      <td className="py-2 px-3 text-slate-600">In-place assignment parking[f][s] = 1 or 0</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold">Sequential Search (Allocation)</td>
                      <td className="py-2 px-3 font-mono text-amber-700 font-bold">O(F × S)</td>
                      <td className="py-2 px-3 text-slate-600">Traverses floors F and slots S to find first free space</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Source Code Snippet */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">// 2D Array Declaration & Lookup</span>
                <span className="text-purple-400">const</span> TOTAL_FLOORS = <span className="text-amber-300">5</span>;<br />
                <span className="text-purple-400">const</span> SLOTS_PER_FLOOR = <span className="text-amber-300">10</span>;<br />
                <span className="text-purple-400">const</span> parking: <span className="text-blue-300">number[][]</span> = Array.from(&#123; length: TOTAL_FLOORS &#125;, () =&gt;<br />
                &nbsp;&nbsp;Array.from(&#123; length: SLOTS_PER_FLOOR &#125;, () =&gt; <span className="text-amber-300">0</span>)<br />
                );<br /><br />
                <span className="text-slate-400">// O(1) Occupy and Vacate:</span><br />
                parking[floorIndex][slotIndex] = <span className="text-amber-300">1</span>; <span className="text-slate-500">// Occupy</span><br />
                parking[floorIndex][slotIndex] = <span className="text-amber-300">0</span>; <span className="text-slate-500">// Vacate</span>
              </div>
            </div>

            {/* Interactive 2D Matrix Sandbox (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Interactive 2D Matrix Sandbox</h4>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  3×5 Mini-Grid
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Click any cell to toggle between Empty (0) and Occupied (1) with instant constant-time O(1) assignment.
              </p>

              {/* Grid representation */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {matrix2D.map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2">
                    <span className="w-16 font-mono text-[11px] font-bold text-slate-500">
                      Row [{rIdx}]:
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      {row.map((val, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => {
                            const newM = matrix2D.map(r => [...r]);
                            newM[rIdx][cIdx] = newM[rIdx][cIdx] === 0 ? 1 : 0;
                            setMatrix2D(newM);
                            setSelectedF(rIdx);
                            setSelectedS(cIdx);
                          }}
                          className={`flex-1 py-2.5 rounded-lg border font-mono font-bold text-xs transition cursor-pointer ${
                            val === 1
                              ? 'bg-rose-500 border-rose-600 text-white shadow-2xs'
                              : 'bg-emerald-500 border-emerald-600 text-white shadow-2xs'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-1">
                <div className="text-purple-300">
                  Target Coordinate: parking[{selectedF}][{selectedS}]
                </div>
                <div className="text-emerald-400">
                  Value: {matrix2D[selectedF][selectedS]} ({matrix2D[selectedF][selectedS] === 1 ? 'Occupied' : 'Empty'})
                </div>
                <div className="text-slate-400 text-[10px]">
                  Memory Address offset: ({selectedF} × 5 + {selectedS}) = {selectedF * 5 + selectedS} elements
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. 1D ARRAY TAB ==================== */}
        {activeTab === '1darray' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">1D Array: Floor-Wise Availability Counts</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Definition:</strong> A one-dimensional array is a linear collection of homogeneous elements stored in contiguous memory locations and accessed by an integer index.
                </p>
                <p>
                  <strong>Role in Parking System:</strong> Stored as <code className="font-mono text-blue-600">availableSlotsPerFloor[floor]</code> of size 5.
                  Each index <code className="font-mono">f</code> stores the exact count of available slots on that floor.
                </p>
                <p>
                  <strong>Algorithm Acceleration:</strong> Instead of looping through all 10 slots of a floor to check if it is full, the system queries <code className="font-mono text-purple-700">availableSlotsPerFloor[f] === 0</code> in <strong>O(1)</strong> time, skipping full floors immediately during search!
                </p>
              </div>

              {/* Code Snippet */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">// 1D Array O(1) Full-Floor Check</span>
                <span className="text-purple-400">const</span> isFloorFull = (floorIndex: <span className="text-blue-300">number</span>): <span className="text-blue-300">boolean</span> =&gt; &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">return</span> availableSlotsPerFloor[floorIndex] === <span className="text-amber-300">0</span>; <span className="text-slate-500">// O(1) check!</span><br />
                &#125;;
              </div>
            </div>

            {/* Interactive 1D Array Sandbox */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Interactive 1D Array Sandbox</h4>
              <p className="text-xs text-slate-500">
                Inspect array index and observe O(1) direct retrieval:
              </p>

              <div className="grid grid-cols-5 gap-2">
                {array1DSandbox.map((count, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSandbox1DIndex(idx);
                      setSandbox1DResult(`availableSlotsPerFloor[${idx}] = ${count} (${count === 0 ? 'Full' : 'Has Space'})`);
                    }}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer font-mono ${
                      sandbox1DIndex === idx
                        ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block font-normal">Index [{idx}]</span>
                    <span className="text-lg font-black block mt-0.5">{count}</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl">
                {sandbox1DResult}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. SINGLY LINKED LIST TAB ==================== */}
        {activeTab === 'singlyll' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Singly Linked List: Active Parked Vehicles</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Definition:</strong> A singly linked list is a linear collection of data elements called nodes, where each node contains data and a pointer/reference to the next node in sequence.
                </p>
                <p>
                  <strong>Role in Parking System:</strong> Maintains the currently parked active vehicles. When a car enters, a new node is created and inserted at the head in <strong>O(1)</strong> time. When a car exits, the list is traversed to delete the matching node in <strong>O(n)</strong> time.
                </p>
                <p>
                  <strong>Why Linked List over Fixed Array for Active Vehicles?</strong> A linked list dynamically grows and shrinks without requiring continuous pre-allocated fixed memory or costly array resizing operations.
                </p>
              </div>

              {/* Node structure code */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
                <span className="text-purple-400">class</span> ActiveVehicleNode &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">public</span> data: ActiveVehicleNodeData;<br />
                &nbsp;&nbsp;<span className="text-purple-400">public</span> next: ActiveVehicleNode | <span className="text-amber-300">null</span>;<br />
                &nbsp;&nbsp;<span className="text-purple-400">constructor</span>(data, next = <span className="text-amber-300">null</span>) &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.data = data;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.next = next;<br />
                &nbsp;&nbsp;&#125;<br />
                &#125;
              </div>
            </div>

            {/* Interactive Linked List Sandbox */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Interactive Singly Linked List Sandbox</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={llInput}
                  onChange={(e) => setLlInput(e.target.value.toUpperCase())}
                  placeholder="Plate (e.g. TN-58-Z-999)"
                  className="flex-1 px-3 py-2 border rounded-xl font-mono text-xs uppercase"
                />
                <button
                  onClick={() => {
                    if (!llInput.trim()) return;
                    setLlNodes([llInput.trim(), ...llNodes]);
                    setLlMsg(`insertHead("${llInput.trim()}") executed in O(1) time.`);
                    setLlInput(`TN-58-Z-${Math.floor(100 + Math.random() * 900)}`);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Insert Head O(1)
                </button>
              </div>

              {/* Node Chain */}
              <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <span>HEAD POINTER</span> &rarr;
                </div>
                <div className="space-y-2">
                  {llNodes.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
                      <div>
                        <span className="text-blue-400 text-[10px] block">Node #{idx + 1}</span>
                        <span className="font-bold text-white">{item}</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = llNodes.filter((_, i) => i !== idx);
                          setLlNodes(updated);
                          setLlMsg(`delete("${item}") executed in O(n) traversal.`);
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        Delete Node
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-slate-500 text-[10px]">&rarr; NULL</div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                {llMsg}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. STACK TAB ==================== */}
        {activeTab === 'stack' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Stack: Recent Vehicle Exits (LIFO)</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Definition:</strong> A Stack is an ordered linear collection where insertion and deletion occur at the same end, called the <strong>TOP</strong>. It follows LIFO (Last In, First Out).
                </p>
                <p>
                  <strong>Role in Parking System:</strong> Every time a vehicle exits, a snapshot record is pushed onto <code className="font-mono text-purple-700">recentExitsStack</code>.
                  This ensures that security guards and parking supervisors always see the <em>most recent exit first</em> when inspecting the facility.
                </p>
                <p>
                  <strong>Core Operations:</strong> <code className="font-mono">push(element)</code>, <code className="font-mono">pop()</code>, <code className="font-mono">peek()</code>, and <code className="font-mono">isEmpty()</code> &mdash; all operating in guaranteed <strong>O(1)</strong> time complexity.
                </p>
              </div>

              {/* Code */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
                <span className="text-purple-400">public</span> push(element: T): <span className="text-blue-300">boolean</span> &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">const</span> newNode = <span className="text-purple-400">new</span> StackNode(element, <span className="text-blue-300">this</span>.topNode);<br />
                &nbsp;&nbsp;<span className="text-blue-300">this</span>.topNode = newNode;<br />
                &nbsp;&nbsp;<span className="text-blue-300">this</span>.count++;<br />
                &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-amber-300">true</span>;<br />
                &#125;
              </div>
            </div>

            {/* Interactive Stack Sandbox */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Interactive LIFO Stack Sandbox</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value.toUpperCase())}
                  placeholder="Record (e.g. TN-58-EXIT-4)"
                  className="flex-1 px-3 py-2 border rounded-xl font-mono text-xs uppercase"
                />
                <button
                  onClick={() => {
                    if (!stackInput.trim()) return;
                    setStackItems([stackInput.trim(), ...stackItems]);
                    setStackMsg(`push("${stackInput.trim()}") executed in O(1). Placed at TOP.`);
                    setStackInput(`TN-58-EXIT-${Math.floor(10 + Math.random() * 89)}`);
                  }}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Push O(1)
                </button>
                <button
                  onClick={() => {
                    if (stackItems.length === 0) {
                      setStackMsg('Stack Underflow: Stack is empty!');
                      return;
                    }
                    const [top, ...rest] = stackItems;
                    setStackItems(rest);
                    setStackMsg(`pop() executed in O(1). Removed top element "${top}".`);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Pop O(1)
                </button>
              </div>

              {/* Stack Chamber */}
              <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-purple-300 text-[10px]">
                  <span>&darr; TOP OF STACK (LIFO)</span>
                  <span>Size: {stackItems.length}</span>
                </div>
                <div className="space-y-1.5">
                  {stackItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 italic">Stack is empty</div>
                  ) : (
                    stackItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border font-bold flex items-center justify-between ${
                          idx === 0
                            ? 'bg-purple-900/80 border-purple-400 text-purple-100'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span>{item}</span>
                        <span className="text-[10px] font-normal">{idx === 0 ? 'TOP' : `Index ${idx}`}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                {stackMsg}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. QUEUE TAB ==================== */}
        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Queue: Waiting Vehicles (FIFO)</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Definition:</strong> A Queue is an ordered linear collection where elements are added at the <strong>REAR</strong> and removed from the <strong>FRONT</strong>. It follows FIFO (First In, First Out).
                </p>
                <p>
                  <strong>Role in Parking System:</strong> When the parking facility is full, arriving vehicles wait in <code className="font-mono text-amber-700">waitingQueue</code>.
                  Using explicit <code className="font-mono">frontNode</code> and <code className="font-mono">rearNode</code> pointers ensures both <code className="font-mono">enqueue()</code> and <code className="font-mono">dequeue()</code> execute in constant time <strong>O(1)</strong>.
                </p>
                <p>
                  <strong>Eligible-FIFO Policy:</strong> When a slot is vacated, the queue preserves arrival order while checking category constraints.
                </p>
              </div>

              {/* Code */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
                <span className="text-purple-400">public</span> enqueue(element: T): <span className="text-blue-300">void</span> &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">const</span> newNode = <span className="text-purple-400">new</span> QueueNode(element, <span className="text-amber-300">null</span>);<br />
                &nbsp;&nbsp;<span className="text-purple-400">if</span> (<span className="text-blue-300">this</span>.isEmpty()) &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.frontNode = newNode;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.rearNode = newNode;<br />
                &nbsp;&nbsp;&#125; <span className="text-purple-400">else</span> &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.rearNode!.next = newNode;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">this</span>.rearNode = newNode;<br />
                &nbsp;&nbsp;&#125;<br />
                &nbsp;&nbsp;<span className="text-blue-300">this</span>.count++;<br />
                &#125;
              </div>
            </div>

            {/* Interactive Queue Sandbox */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Interactive FIFO Queue Sandbox</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={queueInput}
                  onChange={(e) => setQueueInput(e.target.value.toUpperCase())}
                  placeholder="Waitlist Item"
                  className="flex-1 px-3 py-2 border rounded-xl font-mono text-xs uppercase"
                />
                <button
                  onClick={() => {
                    if (!queueInput.trim()) return;
                    setQueueItems([...queueItems, queueInput.trim()]);
                    setQueueMsg(`enqueue("${queueInput.trim()}") executed in O(1). Added to REAR.`);
                    setQueueInput(`TN-58-WAIT-${Math.floor(10 + Math.random() * 89)}`);
                  }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Enqueue O(1)
                </button>
                <button
                  onClick={() => {
                    if (queueItems.length === 0) {
                      setQueueMsg('Queue is empty!');
                      return;
                    }
                    const [first, ...rest] = queueItems;
                    setQueueItems(rest);
                    setQueueMsg(`dequeue() executed in O(1). Served FRONT element "${first}".`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dequeue O(1)
                </button>
              </div>

              {/* Queue Visual */}
              <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-300 text-[10px]">
                  <span>FRONT (Next Out) &rarr; ... &rarr; REAR (Last In)</span>
                  <span>Count: {queueItems.length}</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {queueItems.length === 0 ? (
                    <div className="text-slate-500 italic">Queue is empty</div>
                  ) : (
                    queueItems.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <div
                          className={`p-2 rounded-lg border shrink-0 text-center ${
                            idx === 0
                              ? 'bg-amber-900/80 border-amber-400 text-amber-100'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] block text-slate-400">
                            {idx === 0 ? 'FRONT' : idx === queueItems.length - 1 ? 'REAR' : `#${idx + 1}`}
                          </span>
                          <span className="font-bold text-xs">{item}</span>
                        </div>
                        {idx < queueItems.length - 1 && <span>&rarr;</span>}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                {queueMsg}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 6. HISTORY LINKED LIST & LIST TAB ==================== */}
        {(activeTab === 'historyll' || activeTab === 'list') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'historyll' ? 'Linked List for Parking History' : 'Abstract List vs Concrete Implementations'}
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Audit Trail Integrity:</strong> In parking operations, once a session starts, its record must never be deleted upon exit. Instead, the <code className="font-mono text-blue-600">ParkingHistoryLinkedList</code> updates the existing record with the exit timestamp and computed duration in-place.
              </p>
              <p>
                <strong>Abstract List vs Array vs Linked List:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Abstract List (ADT):</strong> An interface specifying operations (insert, remove, get, size) without dictating memory representation.
                </li>
                <li>
                  <strong>Array:</strong> Concrete implementation with contiguous memory and fast O(1) random access, but fixed capacity and expensive O(n) insertions/deletions.
                </li>
                <li>
                  <strong>Linked List:</strong> Concrete implementation with dynamic memory allocation and O(1) head insertion/deletion, but linear O(n) traversal.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
