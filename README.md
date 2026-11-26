# Multi-Storey Parking Management System
### Data Structures Mini-Project | Academic Year 2024–2025 / 2025–2026
**Thiagarajar College of Engineering (TCE), Madurai**  
**Department of Information Technology**

---

## 1. Project Overview

The **Multi-Storey Parking Management System** is an engineering project demonstrating the real-world, production-grade application of fundamental linear and multidimensional Data Structures. Rather than relying on black-box database engines, every major parking operational workflow—vehicle entry, first-eligible slot allocation, vehicle exit, waiting waitlist prioritization, and recent exit auditing—is powered by custom, explicitly implemented Data Structures in TypeScript/JavaScript.

The system manages a 5-storey facility with 10 slots per floor (50 total parking spaces), accounting for category constraints (Normal, VIP, Electric Vehicle charging, Disabled accessibility, and Out-of-Service maintenance).

---

## 2. Data Structure Mapping & Architecture

| Data Structure | Implementation File | Concrete Purpose in the Parking System | Key Operations & Time Complexity |
| :--- | :--- | :--- | :--- |
| **2D Array** | `src/dataStructures/Array2D.ts` | Binary Occupancy Grid (`parking[floor][slot]`). `0` represents an empty slot; `1` represents an occupied slot. | Direct Lookup: $\mathcal{O}(1)$<br>Vacate/Occupy: $\mathcal{O}(1)$<br>Full Search: $\mathcal{O}(F \times S)$ |
| **1D Array** | `src/dataStructures/Array2D.ts` | Floor-wise available slot counts (`availableCounts[floor]`). Speeds up search by skipping full floors. | Get Floor Free: $\mathcal{O}(1)$<br>IsFloorFull: $\mathcal{O}(1)$ |
| **Singly Linked List** | `src/dataStructures/SinglyLinkedList.ts` | Dynamic pool of currently parked active vehicles (`ActiveVehiclesLinkedList`). Nodes contain registration, timestamps, and floor/slot references. | `insertHead`: $\mathcal{O}(1)$<br>`search(regNo)`: $\mathcal{O}(n)$<br>`delete(regNo)`: $\mathcal{O}(n)$ |
| **Audit Linked List** | `src/dataStructures/HistoryLinkedList.ts` | Persistent audit ledger of all vehicle parking sessions (`ParkingHistoryLinkedList`). Records update exit time in-place without deletion. | `addRecordHead`: $\mathcal{O}(1)$<br>`markExit`: $\mathcal{O}(n)$<br>`filter/search`: $\mathcal{O}(n)$ |
| **LIFO Stack** | `src/dataStructures/Stack.ts` | Recent vehicle exits (`RecentExitsStack`). Displays most recent exit first to security personnel. Includes an educational sandbox. | `push(record)`: $\mathcal{O}(1)$<br>`pop()`: $\mathcal{O}(1)$<br>`peek()`: $\mathcal{O}(1)$ |
| **FIFO Queue** | `src/dataStructures/Queue.ts` | Waiting vehicles queue with `frontNode` and `rearNode` pointers (`Queue<WaitingVehicle>`). Implements category-aware eligible-FIFO reallocation. | `enqueue(vehicle)`: $\mathcal{O}(1)$<br>`dequeue()`: $\mathcal{O}(1)$<br>`peek()`: $\mathcal{O}(1)$ |
| **List (Metadata)** | `src/types/index.ts` | Configuration lists for floor numbers, categories, and rate tiers, demonstrating Abstract Data Types (ADT). | Sequential Access: $\mathcal{O}(n)$ |

---

## 3. Core Algorithms

### A. First-Eligible-Fit Parking Allocation
1. **Input**: Vehicle Registration Number, Vehicle Type, Parking Category (`Normal`, `VIP`, `EV`, `Disabled`).
2. **Phase 1 (Designated Reservation Search)**:
   - If the vehicle is VIP, EV, or Disabled, first scan for an empty slot designated specifically for that category.
3. **Phase 2 (Sequential 2D Traversal)**:
   - For `floor = 0` to `TOTAL_FLOORS - 1`:
     - Check `availableCounts[floor] === 0` in $\mathcal{O}(1)$. If zero, log floor skip and immediately continue to the next floor.
     - For `slot = 0` to `SLOTS_PER_FLOOR - 1`:
       - Check if `parking[floor][slot] === 0` and slot is compatible with vehicle category.
       - If compatible: Mark `parking[floor][slot] = 1`, decrement `availableCounts[floor]`, insert into Singly Linked List, prepend to History Linked List, and return success.
4. **Phase 3 (Fallback to Waiting Queue)**:
   - If no eligible slot exists across all 5 floors, notify user and offer FIFO queue enrollment.

### B. Vehicle Exit & Eligible-FIFO Reallocation
1. Locate vehicle in active singly linked list by case-insensitive registration string ($\mathcal{O}(n)$).
2. Compute parking duration: $\text{durationMinutes} = \max(1, \lfloor(\text{exitTimestamp} - \text{entryTimestamp}) / 60000\rfloor)$.
3. Delete node from active singly linked list ($\mathcal{O}(n)$).
4. Reset slot in 2D array: `parking[floor - 1][slot - 1] = 0`.
5. Update 1D availability array: `availableCounts[floor - 1]++`.
6. Update history node with exit timestamp and duration.
7. Push snapshot onto `recentExitsStack` ($\mathcal{O}(1)$).
8. **Eligible-FIFO Reallocation**:
   - If `waitingQueue.isEmpty()` is false, inspect queue items in arrival order.
   - Find the first waiting vehicle whose category is compatible with the newly freed slot.
   - Remove that vehicle from queue, occupy the slot, and create a new active vehicle node.
   - If front vehicle was incompatible, its queue position is safely preserved.

---

## 4. Time and Space Complexity Analysis

| Component | Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **2D Array (`parking[5][10]`)** | Direct slot read / write | $\mathcal{O}(1)$ | $\mathcal{O}(F \times S)$ = 50 integers |
| **1D Array (`availableCounts[5]`)** | Query floor available count | $\mathcal{O}(1)$ | $\mathcal{O}(F)$ = 5 integers |
| **Active Singly Linked List** | Insert at Head (`insertHead`) | $\mathcal{O}(1)$ | $\mathcal{O}(N)$ where $N \le 50$ |
| | Search by Registration | $\mathcal{O}(N)$ | $\mathcal{O}(1)$ auxiliary |
| | Delete by Registration | $\mathcal{O}(N)$ | $\mathcal{O}(1)$ auxiliary |
| **Recent Exits Stack** | Push, Pop, Peek | $\mathcal{O}(1)$ | $\mathcal{O}(E)$ where $E$ is exit count |
| **Waiting Vehicles Queue** | Enqueue at Rear, Dequeue at Front | $\mathcal{O}(1)$ | $\mathcal{O}(Q)$ where $Q$ is waitlist size |

---

## 5. Major Functions and Implementation Directory

- `src/dataStructures/Array2D.ts`:
  - `findFirstAvailableSlot(vehicleCategory)`: Sequential traversal algorithm with educational step trace.
  - `occupySlot(f, s)`, `vacateSlot(f, s)`: Direct matrix updates.
  - `isFloorFull(f)`, `isParkingFull()`: Fast 1D count checks.
  - `getExtremeFloors()`: Identifies maximum & minimum availability with tie handling.
  - `suggestBestFloor(category)`: Intelligent floor recommender.
- `src/dataStructures/SinglyLinkedList.ts`:
  - `insertHead(data)`, `delete(regNo)`, `search(regNo)`, `toArray()`.
- `src/dataStructures/Stack.ts`:
  - `push(element)`, `pop()`, `peek()`, `isEmpty()`, `display()`.
- `src/dataStructures/Queue.ts`:
  - `enqueue(element)`, `dequeue()`, `peek()`, `removeByRegistration()`.
- `src/context/ParkingContext.tsx`:
  - State coordination, persistence synchronization, toast dispatching, confirmation modals.
- `src/services/storageService.ts`:
  - `loadParkingData()`, `saveParkingData()`, `getInitialDemoData()`.

---

## 6. Installation and Execution

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 7. Short Project Demonstration & Viva Walkthrough Guide

1. **Dashboard (`/`)**: Show the 8 summary metrics, floor-wise bar chart, available vs occupied pie chart, and the max/min available floors.
2. **Parking Layout (`/layout`)**: Show all 50 slots organized into Floors 1 to 5 with distinct color coding (Green: available, Red: occupied, Purple: VIP, Cyan: EV, Amber: Disabled). Click any slot to inspect coordinates `parking[f][s]`.
3. **Vehicle Entry (`/entry`)**: Submit a test plate (e.g. `TN-58-TEST-01`). Observe the educational trace showing each checked slot and the constant-time insertion into the Singly Linked List.
4. **Vehicle Exit (`/exit`)**: Select an active vehicle, note the computed parking duration, and confirm exit. Show how the slot becomes vacant and is pushed onto the Recent Exits Stack.
5. **Waiting Queue (`/queue`)**: Show FIFO pointer behavior (`FRONT` & `REAR`). Enqueue a car and demonstrate manual dequeue or automatic promotion upon vehicle exit.
6. **Recent Exits Stack (`/stack`)**: Test the interactive Push, Pop, and Peek sandbox. Explain why popping from the demonstration stack does not alter permanent history.
7. **Data Structures Lab (`/dslab`)**: Review the asymptotic Big-O complexities and test the interactive sandboxes for 1D/2D array indexing, linked list insertion/deletion, stack LIFO, and queue FIFO.
