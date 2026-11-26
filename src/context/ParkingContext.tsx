/**
 * Centralized State Management and Parking Logic Controller
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Reconstructs explicit Data Structures:
 * - 2D Matrix Grid: ParkingArrayGrid (2D occupancy + 1D available counts + categories)
 * - Singly Linked List: ActiveVehiclesLinkedList
 * - Historical Linked List: ParkingHistoryLinkedList
 * - FIFO Queue: Queue<WaitingVehicle>
 * - LIFO Stack: Stack<ExitRecord>
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  ActiveVehicleNodeData,
  AllocationResult,
  AppTheme,
  ExitRecord,
  FloorStats,
  ParkingCategory,
  ParkingHistoryRecord,
  SlotCategory,
  Vehicle,
  WaitingVehicle
} from '../types';
import { ParkingArrayGrid, SLOTS_PER_FLOOR, TOTAL_FLOORS, TOTAL_SLOTS } from '../dataStructures/Array2D';
import { ActiveVehiclesLinkedList } from '../dataStructures/SinglyLinkedList';
import { ParkingHistoryLinkedList } from '../dataStructures/HistoryLinkedList';
import { Queue } from '../dataStructures/Queue';
import { Stack } from '../dataStructures/Stack';
import { loadParkingData, resetToDemoData, saveParkingData, StorageSchema } from '../services/storageService';
import { dbService, DbTransaction, DatabaseStatus } from '../services/databaseService';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface ParkingContextType {
  // Underlying explicit data structure instances
  grid: ParkingArrayGrid;
  activeVehiclesList: ActiveVehiclesLinkedList;
  historyList: ParkingHistoryLinkedList;
  waitingQueue: Queue<WaitingVehicle>;
  recentExitsStack: Stack<ExitRecord>;

  // Reactive state snapshots for UI rendering
  activeVehicles: ActiveVehicleNodeData[];
  historyRecords: ParkingHistoryRecord[];
  waitingVehicles: WaitingVehicle[];
  recentExits: ExitRecord[];
  occupancyMatrix: number[][];
  slotCategories: SlotCategory[][];
  availableCounts: number[];
  totalServedCount: number;

  // Computed metrics
  totalSlots: number;
  totalOccupied: number;
  totalAvailable: number;
  totalReserved: number;
  totalOutOfService: number;
  overallOccupancyPercent: number;
  floorStats: FloorStats[];

  // Allocation & Transaction Functions
  parkVehicle: (vehicle: Vehicle) => AllocationResult;
  enqueueWaitingVehicle: (vehicle: Vehicle) => { success: boolean; message: string; position?: number };
  exitVehicle: (registrationNumber: string) => {
    success: boolean;
    message: string;
    exitRecord?: ExitRecord;
    reallocatedVehicle?: WaitingVehicle | null;
  };
  cancelWaitingVehicle: (registrationNumber: string) => boolean;
  dequeueManual: () => WaitingVehicle | null;
  updateSlotCategory: (floor: number, slot: number, category: SlotCategory) => { success: boolean; message: string };
  resetData: () => void;
  loadDemo: () => void;

  // Database State & Transaction Log
  dbTransactions: DbTransaction[];
  isDbConnected: boolean;
  databaseStatus: DatabaseStatus;
  lastEnteredPlate: string | null;
  clearLastEnteredPlate: () => void;

  // Background Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // UI helpers
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogOptions | null;
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  closeConfirmDialog: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial data from LocalStorage
  const [initialData] = useState<StorageSchema>(() => loadParkingData());

  // Background theme state
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('PARKING_APP_THEME');
      if (saved && ['royal-slate', 'modern-light', 'emerald-dark', 'twilight-violet'].includes(saved)) {
        return saved as AppTheme;
      }
    } catch {}
    return 'royal-slate';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('PARKING_APP_THEME', newTheme);
    } catch {}
  };

  // Recently entered vehicle plate for visual highlight in the entry list
  const [lastEnteredPlate, setLastEnteredPlate] = useState<string | null>(null);
  const clearLastEnteredPlate = () => setLastEnteredPlate(null);

  // Instantiate explicit Data Structures
  const [grid, setGrid] = useState<ParkingArrayGrid>(
    () => new ParkingArrayGrid(initialData.occupancy, initialData.slotCategories, initialData.availableCounts)
  );

  const [activeVehiclesList, setActiveVehiclesList] = useState<ActiveVehiclesLinkedList>(
    () => new ActiveVehiclesLinkedList(initialData.activeVehicles)
  );

  const [historyList, setHistoryList] = useState<ParkingHistoryLinkedList>(
    () => new ParkingHistoryLinkedList(initialData.historyRecords)
  );

  const [waitingQueue, setWaitingQueue] = useState<Queue<WaitingVehicle>>(
    () => new Queue<WaitingVehicle>(initialData.waitingQueue)
  );

  const [recentExitsStack, setRecentExitsStack] = useState<Stack<ExitRecord>>(
    () => new Stack<ExitRecord>(100, [...initialData.recentExits].reverse())
  );

  const [totalServedCount, setTotalServedCount] = useState<number>(initialData.totalServedCount || 11);
  const [dbTransactions, setDbTransactions] = useState<DbTransaction[]>(() => dbService.getRecentTransactions());
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>(() => dbService.getConnectionStatus());

  // Synchronize initial data to IndexedDB
  useEffect(() => {
    dbService.syncActiveVehicles(initialData.activeVehicles);
  }, []);

  // Reactive state mirrors
  const [activeVehicles, setActiveVehicles] = useState<ActiveVehicleNodeData[]>(() => activeVehiclesList.toArray());
  const [historyRecords, setHistoryRecords] = useState<ParkingHistoryRecord[]>(() => historyList.toArray());
  const [waitingVehicles, setWaitingVehicles] = useState<WaitingVehicle[]>(() => waitingQueue.toArray());
  const [recentExits, setRecentExits] = useState<ExitRecord[]>(() => recentExitsStack.toArray());
  const [occupancyMatrix, setOccupancyMatrix] = useState<number[][]>(() => grid.occupancy.map(r => [...r]));
  const [slotCategories, setSlotCategories] = useState<SlotCategory[][]>(() => grid.slotCategories.map(r => [...r]));
  const [availableCounts, setAvailableCounts] = useState<number[]>(() => [...grid.availableCounts]);

  // Notifications & Modals
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirmDialog = (options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // Helper to synchronize reactive state with underlying data structures & persist to LocalStorage
  const syncAndPersist = (customTotalServed?: number) => {
    const updatedActive = activeVehiclesList.toArray();
    const updatedHistory = historyList.toArray();
    const updatedQueue = waitingQueue.toArray();
    const updatedExits = recentExitsStack.toArray();
    const updatedOccupancy = grid.occupancy.map(r => [...r]);
    const updatedCats = grid.slotCategories.map(r => [...r]);
    const updatedAvailable = [...grid.availableCounts];
    const newTotalServed = customTotalServed !== undefined ? customTotalServed : totalServedCount;

    setActiveVehicles(updatedActive);
    setHistoryRecords(updatedHistory);
    setWaitingVehicles(updatedQueue);
    setRecentExits(updatedExits);
    setOccupancyMatrix(updatedOccupancy);
    setSlotCategories(updatedCats);
    setAvailableCounts(updatedAvailable);
    if (customTotalServed !== undefined) {
      setTotalServedCount(customTotalServed);
    }

    const payload: StorageSchema = {
      version: '1.0.0',
      occupancy: updatedOccupancy,
      slotCategories: updatedCats,
      availableCounts: updatedAvailable,
      activeVehicles: updatedActive,
      historyRecords: updatedHistory,
      waitingQueue: updatedQueue,
      recentExits: updatedExits,
      totalServedCount: newTotalServed
    };
    saveParkingData(payload);
  };

  /**
   * Parks a vehicle using first-eligible search algorithm
   */
  const parkVehicle = (vehicle: Vehicle): AllocationResult => {
    const cleanReg = vehicle.registrationNumber.trim().toUpperCase();

    // 1. Validation
    if (!cleanReg) {
      addToast('Validation Error', 'Vehicle registration number is required.', 'error');
      return { success: false, message: 'Vehicle registration number is required.', trace: [] };
    }

    // 2. Duplicate active check
    if (activeVehiclesList.contains(cleanReg)) {
      addToast('Duplicate Vehicle', `Vehicle ${cleanReg} is already parked in the facility!`, 'error');
      return {
        success: false,
        message: `Vehicle ${cleanReg} is already parked in the facility!`,
        trace: []
      };
    }

    // 3. Duplicate queue check
    if (waitingQueue.searchByRegistration(cleanReg)) {
      addToast('Already in Queue', `Vehicle ${cleanReg} is already waiting in the queue.`, 'warning');
      return {
        success: false,
        message: `Vehicle ${cleanReg} is already in the waiting queue.`,
        trace: []
      };
    }

    // 4. Run Search Allocation Algorithm
    const { floor, slot, trace } = grid.findFirstAvailableSlot(vehicle.parkingCategory);

    if (floor === null || slot === null) {
      const fullMsg = grid.isParkingFull()
        ? 'All parking spaces are currently occupied.'
        : `No suitable ${vehicle.parkingCategory} slot is currently available.`;
      
      addToast('Allocation Failed', fullMsg, 'warning');
      return {
        success: false,
        message: fullMsg,
        trace,
        queued: false
      };
    }

    // 5. Successful Allocation
    const entryTimestamp = new Date().toISOString();
    grid.occupySlot(floor, slot);

    const activeRecord: ActiveVehicleNodeData = {
      registrationNumber: cleanReg,
      vehicleType: vehicle.vehicleType,
      parkingCategory: vehicle.parkingCategory,
      ownerName: vehicle.ownerName?.trim() || undefined,
      contactNumber: vehicle.contactNumber?.trim() || undefined,
      floorNumber: floor,
      slotNumber: slot,
      entryTimestamp
    };

    // Insert into Singly Linked List
    activeVehiclesList.insertHead(activeRecord);

    // Append into Parking History Linked List
    const historyRec: ParkingHistoryRecord = {
      id: `HIST-${Date.now()}`,
      ...activeRecord,
      exitTimestamp: null,
      parkingDurationMinutes: null
    };
    historyList.addRecordHead(historyRec);

    // Commit to database
    dbService.commitVehicleEntry(activeRecord);
    setDbTransactions(dbService.getRecentTransactions());
    setDatabaseStatus(dbService.getConnectionStatus());
    setLastEnteredPlate(cleanReg);

    const newServed = totalServedCount + 1;
    syncAndPersist(newServed);

    const successMsg = `Vehicle ${cleanReg} parked successfully on Floor ${floor}, Slot ${slot}. Stored in Database.`;
    addToast('Parking Success', successMsg, 'success');

    return {
      success: true,
      floor,
      slot,
      message: successMsg,
      trace
    };
  };

  /**
   * Enqueues a vehicle into the FIFO waiting queue
   */
  const enqueueWaitingVehicle = (vehicle: Vehicle): { success: boolean; message: string; position?: number } => {
    const cleanReg = vehicle.registrationNumber.trim().toUpperCase();

    if (!cleanReg) {
      addToast('Validation Error', 'Vehicle registration number is required.', 'error');
      return { success: false, message: 'Registration number is required.' };
    }

    if (activeVehiclesList.contains(cleanReg)) {
      addToast('Already Parked', `Vehicle ${cleanReg} is already actively parked.`, 'error');
      return { success: false, message: 'Vehicle is already actively parked.' };
    }

    if (waitingQueue.searchByRegistration(cleanReg)) {
      addToast('Already in Queue', `Vehicle ${cleanReg} is already in the queue.`, 'warning');
      return { success: false, message: 'Vehicle is already in the queue.' };
    }

    const waitingItem: WaitingVehicle = {
      queueId: `Q-${Date.now()}`,
      registrationNumber: cleanReg,
      vehicleType: vehicle.vehicleType,
      parkingCategory: vehicle.parkingCategory,
      ownerName: vehicle.ownerName?.trim() || undefined,
      contactNumber: vehicle.contactNumber?.trim() || undefined,
      arrivalTime: new Date().toISOString()
    };

    waitingQueue.enqueue(waitingItem);
    const pos = waitingQueue.size();
    syncAndPersist();

    addToast('Enqueued', `Vehicle ${cleanReg} added to Waiting Queue at position #${pos}.`, 'info');
    return {
      success: true,
      message: `Vehicle ${cleanReg} added to Waiting Queue at position #${pos}.`,
      position: pos
    };
  };

  /**
   * Exits a vehicle, updates history, pushes to LIFO Stack, and executes eligible-FIFO queue reallocation
   */
  const exitVehicle = (registrationNumber: string) => {
    const cleanReg = registrationNumber.trim().toUpperCase();
    const activeNode = activeVehiclesList.search(cleanReg);

    if (!activeNode) {
      addToast('Exit Failed', `Vehicle ${cleanReg} is not currently registered as active.`, 'error');
      return {
        success: false,
        message: `Vehicle ${cleanReg} is not registered as active.`
      };
    }

    const vehicleData = activeNode.data;
    const floor = vehicleData.floorNumber;
    const slot = vehicleData.slotNumber;
    const exitTimestamp = new Date().toISOString();

    // Duration calculation in minutes
    const entryTime = new Date(vehicleData.entryTimestamp).getTime();
    const exitTime = new Date(exitTimestamp).getTime();
    const durationMinutes = Math.max(1, Math.round((exitTime - entryTime) / 60000));

    // Remove from active singly linked list
    activeVehiclesList.delete(cleanReg);

    // Vacate slot in 2D array
    grid.vacateSlot(floor, slot);

    // Update historical linked list record
    historyList.markExit(cleanReg, exitTimestamp, durationMinutes);

    // Check waiting queue for an eligible vehicle to immediately reallocate this newly freed slot
    let reallocatedVehicle: WaitingVehicle | null = null;
    const slotCat = grid.slotCategories[floor - 1][slot - 1];

    if (!waitingQueue.isEmpty()) {
      const waitlist = waitingQueue.toArray();
      // Find the first waiting vehicle whose category is compatible with this freed slot
      const eligible = waitlist.find(wv => grid.isSlotCompatible(slotCat, wv.parkingCategory));

      if (eligible) {
        // Remove this eligible vehicle from the queue
        waitingQueue.removeByRegistration(eligible.registrationNumber);

        // Occupy the slot for the eligible vehicle
        grid.occupySlot(floor, slot);

        const newActive: ActiveVehicleNodeData = {
          registrationNumber: eligible.registrationNumber,
          vehicleType: eligible.vehicleType,
          parkingCategory: eligible.parkingCategory,
          ownerName: eligible.ownerName,
          contactNumber: eligible.contactNumber,
          floorNumber: floor,
          slotNumber: slot,
          entryTimestamp: exitTimestamp
        };

        activeVehiclesList.insertHead(newActive);

        historyList.addRecordHead({
          id: `HIST-${Date.now()}`,
          ...newActive,
          exitTimestamp: null,
          parkingDurationMinutes: null
        });

        reallocatedVehicle = eligible;
      }
    }

    // Push exit record onto Recent Exits LIFO Stack
    const exitRecord: ExitRecord = {
      id: `EXIT-${Date.now()}`,
      registrationNumber: cleanReg,
      vehicleType: vehicleData.vehicleType,
      parkingCategory: vehicleData.parkingCategory,
      floorNumber: floor,
      slotNumber: slot,
      entryTimestamp: vehicleData.entryTimestamp,
      exitTimestamp,
      parkingDurationMinutes: durationMinutes,
      reallocatedToWaitingVehicle: reallocatedVehicle ? reallocatedVehicle.registrationNumber : null
    };

    recentExitsStack.push(exitRecord);
    dbService.commitVehicleExit(exitRecord);
    setDbTransactions(dbService.getRecentTransactions());
    syncAndPersist();

    let msg = `Vehicle ${cleanReg} exited from Floor ${floor}, Slot ${slot}. Duration: ${durationMinutes} min.`;
    if (reallocatedVehicle) {
      msg += ` Slot immediately reallocated to waiting vehicle ${reallocatedVehicle.registrationNumber}!`;
      addToast('Reallocated to Waitlist', `Waiting vehicle ${reallocatedVehicle.registrationNumber} has been allocated Floor ${floor}, Slot ${slot}.`, 'success');
    }
    addToast('Vehicle Exited', msg, 'info');

    return {
      success: true,
      message: msg,
      exitRecord,
      reallocatedVehicle
    };
  };

  /**
   * Cancels/removes a waiting vehicle from queue
   */
  const cancelWaitingVehicle = (registrationNumber: string): boolean => {
    const removed = waitingQueue.removeByRegistration(registrationNumber);
    if (removed) {
      syncAndPersist();
      addToast('Queue Updated', `Vehicle ${registrationNumber} removed from waiting queue.`, 'info');
      return true;
    }
    return false;
  };

  /**
   * Dequeue manually for educational demonstration
   */
  const dequeueManual = (): WaitingVehicle | null => {
    const item = waitingQueue.dequeue();
    if (item) {
      syncAndPersist();
      addToast('Dequeued', `Dequeued vehicle ${item.registrationNumber} from front of queue.`, 'info');
    } else {
      addToast('Queue Empty', 'Waiting queue is already empty.', 'warning');
    }
    return item;
  };

  /**
   * Updates slot category (Normal, VIP, EV, Disabled, Out of Service)
   */
  const updateSlotCategory = (floor: number, slot: number, category: SlotCategory) => {
    const isOccupied = grid.occupancy[floor - 1][slot - 1] === 1;
    if (isOccupied) {
      addToast('Cannot Modify', `Floor ${floor}, Slot ${slot} is currently occupied by a parked vehicle.`, 'error');
      return { success: false, message: 'Cannot modify reservation category of an occupied slot.' };
    }

    const success = grid.setSlotCategory(floor, slot, category);
    if (success) {
      syncAndPersist();
      addToast('Slot Updated', `Floor ${floor}, Slot ${slot} category set to "${category}".`, 'success');
      return { success: true, message: `Updated Floor ${floor}, Slot ${slot} to ${category}.` };
    }
    return { success: false, message: 'Invalid floor or slot number.' };
  };

  /**
   * Resets all data to clean initial demo data
   */
  const resetData = () => {
    const demo = resetToDemoData();
    const newGrid = new ParkingArrayGrid(demo.occupancy, demo.slotCategories, demo.availableCounts);
    const newActive = new ActiveVehiclesLinkedList(demo.activeVehicles);
    const newHistory = new ParkingHistoryLinkedList(demo.historyRecords);
    const newQueue = new Queue<WaitingVehicle>(demo.waitingQueue);
    const newStack = new Stack<ExitRecord>(100, [...demo.recentExits].reverse());

    setGrid(newGrid);
    setActiveVehiclesList(newActive);
    setHistoryList(newHistory);
    setWaitingQueue(newQueue);
    setRecentExitsStack(newStack);
    setTotalServedCount(demo.totalServedCount);

    setActiveVehicles(newActive.toArray());
    setHistoryRecords(newHistory.toArray());
    setWaitingVehicles(newQueue.toArray());
    setRecentExits(newStack.toArray());
    setOccupancyMatrix(newGrid.occupancy.map(r => [...r]));
    setSlotCategories(newGrid.slotCategories.map(r => [...r]));
    setAvailableCounts([...newGrid.availableCounts]);

    addToast('Data Reset', 'All parking data structures reset to default demo dataset.', 'info');
  };

  const loadDemo = () => {
    resetData();
  };

  // Compute metrics and floor statistics
  const { totalOccupied, totalAvailable, totalReserved, totalOutOfService, floorStats } = useMemo(() => {
    let occ = 0;
    let avail = 0;
    let res = 0;
    let oos = 0;

    const stats: FloorStats[] = [];

    for (let f = 0; f < TOTAL_FLOORS; f++) {
      let floorOcc = 0;
      let floorAvail = 0;
      let floorRes = 0;
      let floorOos = 0;

      for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
        const cat = slotCategories[f]?.[s] || 'Normal';
        const isOcc = occupancyMatrix[f]?.[s] === 1;

        if (cat === 'Out of Service') {
          floorOos++;
          oos++;
        } else if (isOcc) {
          floorOcc++;
          occ++;
        } else {
          // Empty slot
          floorAvail++;
          avail++;
          if (cat !== 'Normal') {
            floorRes++;
            res++;
          }
        }
      }

      const usableFloorSlots = SLOTS_PER_FLOOR - floorOos;
      const floorPct = usableFloorSlots > 0 ? Math.round((floorOcc / usableFloorSlots) * 100) : 0;

      stats.push({
        floorNumber: f + 1,
        totalSlots: SLOTS_PER_FLOOR,
        occupiedSlots: floorOcc,
        availableSlots: floorAvail,
        reservedSlots: floorRes,
        outOfServiceSlots: floorOos,
        occupancyPercentage: floorPct
      });
    }

    return {
      totalOccupied: occ,
      totalAvailable: avail,
      totalReserved: res,
      totalOutOfService: oos,
      floorStats: stats
    };
  }, [occupancyMatrix, slotCategories]);

  const usableSlots = TOTAL_SLOTS - totalOutOfService;
  const overallOccupancyPercent = usableSlots > 0 ? Math.round((totalOccupied / usableSlots) * 100) : 0;

  return (
    <ParkingContext.Provider
      value={{
        grid,
        activeVehiclesList,
        historyList,
        waitingQueue,
        recentExitsStack,
        activeVehicles,
        historyRecords,
        waitingVehicles,
        recentExits,
        occupancyMatrix,
        slotCategories,
        availableCounts,
        totalServedCount,
        totalSlots: TOTAL_SLOTS,
        totalOccupied,
        totalAvailable,
        totalReserved,
        totalOutOfService,
        overallOccupancyPercent,
        floorStats,
        parkVehicle,
        enqueueWaitingVehicle,
        exitVehicle,
        cancelWaitingVehicle,
        dequeueManual,
        updateSlotCategory,
        resetData,
        loadDemo,
        dbTransactions,
        isDbConnected: true,
        databaseStatus,
        lastEnteredPlate,
        clearLastEnteredPlate,
        theme,
        setTheme,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = (): ParkingContextType => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
