/**
 * LocalStorage Persistence and Sample Data Service
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Handles serialization/deserialization and reconstruction of:
 * - 2D Occupancy Array & 1D Available Count Array
 * - Active Vehicles Singly Linked List
 * - Parking History Linked List
 * - Waiting Vehicles FIFO Queue
 * - Recent Exits LIFO Stack
 */

import { ActiveVehicleNodeData, ExitRecord, ParkingHistoryRecord, SlotCategory, WaitingVehicle } from '../types';
import { SLOTS_PER_FLOOR, TOTAL_FLOORS } from '../dataStructures/Array2D';

export const STORAGE_KEY = 'TCE_PARKING_SYSTEM_DATA_V1';

export interface StorageSchema {
  version: string;
  occupancy: number[][];
  slotCategories: SlotCategory[][];
  availableCounts: number[];
  activeVehicles: ActiveVehicleNodeData[];
  historyRecords: ParkingHistoryRecord[];
  waitingQueue: WaitingVehicle[];
  recentExits: ExitRecord[];
  totalServedCount: number;
}

/**
 * Generates an internally consistent, realistic demo dataset
 */
export function getInitialDemoData(): StorageSchema {
  // Base 2D occupancy matrix: 5 floors × 10 slots initialized to 0
  const occupancy: number[][] = Array.from({ length: TOTAL_FLOORS }, () =>
    Array.from({ length: SLOTS_PER_FLOOR }, () => 0)
  );

  // Slot categories:
  // Floor 1: S1 (VIP), S2 (VIP), S3 (Disabled), S4 (EV), S5-S10 (Normal)
  // Floor 2: S1 (EV), S2-S10 (Normal)
  // Floor 3: All Normal
  // Floor 4: All Normal
  // Floor 5: S1-S9 (Normal), S10 (Out of Service)
  const slotCategories: SlotCategory[][] = Array.from({ length: TOTAL_FLOORS }, (_, f) =>
    Array.from({ length: SLOTS_PER_FLOOR }, (_, s) => {
      if (f === 0 && s === 0) return 'VIP';
      if (f === 0 && s === 1) return 'VIP';
      if (f === 0 && s === 2) return 'Disabled';
      if (f === 0 && s === 3) return 'Electric Vehicle';
      if (f === 1 && s === 0) return 'Electric Vehicle';
      if (f === 4 && s === 9) return 'Out of Service';
      return 'Normal';
    })
  );

  const now = new Date();
  const getPastTime = (minutesAgo: number) => {
    return new Date(now.getTime() - minutesAgo * 60000).toISOString();
  };

  // 6 Active Parked Vehicles (All assigned slots are flagged 1 in occupancy matrix)
  const activeVehicles: ActiveVehicleNodeData[] = [
    {
      registrationNumber: 'TN-58-VIP-0001',
      vehicleType: 'Car',
      parkingCategory: 'VIP',
      ownerName: 'Dr. M. Palanivelu (Principal/Dean)',
      contactNumber: '9842100001',
      floorNumber: 1,
      slotNumber: 1,
      entryTimestamp: getPastTime(180)
    },
    {
      registrationNumber: 'TN-58-HC-2401',
      vehicleType: 'Car',
      parkingCategory: 'Disabled',
      ownerName: 'Prof. K. Sundaramoorthy',
      contactNumber: '9842100002',
      floorNumber: 1,
      slotNumber: 3,
      entryTimestamp: getPastTime(125)
    },
    {
      registrationNumber: 'TN-59-EV-8822',
      vehicleType: 'Car',
      parkingCategory: 'Electric Vehicle',
      ownerName: 'Anand Kumar (Research Scholar)',
      contactNumber: '9842100003',
      floorNumber: 1,
      slotNumber: 4,
      entryTimestamp: getPastTime(75)
    },
    {
      registrationNumber: 'TN-58-AB-4509',
      vehicleType: 'Car',
      parkingCategory: 'Normal',
      ownerName: 'S. Meenakshi',
      contactNumber: '9842100004',
      floorNumber: 1,
      slotNumber: 5,
      entryTimestamp: getPastTime(50)
    },
    {
      registrationNumber: 'TN-59-CD-1122',
      vehicleType: 'Motorcycle',
      parkingCategory: 'Normal',
      ownerName: 'R. Vignesh (B.Tech IT Student)',
      contactNumber: '9842100005',
      floorNumber: 2,
      slotNumber: 2,
      entryTimestamp: getPastTime(35)
    },
    {
      registrationNumber: 'TN-67-EF-9900',
      vehicleType: 'Car',
      parkingCategory: 'Normal',
      ownerName: 'T. Karthikeyan',
      contactNumber: '9842100006',
      floorNumber: 3,
      slotNumber: 1,
      entryTimestamp: getPastTime(20)
    }
  ];

  // Mark occupancy matrix for active vehicles
  for (const v of activeVehicles) {
    occupancy[v.floorNumber - 1][v.slotNumber - 1] = 1;
  }

  // Calculate 1D available counts
  const availableCounts: number[] = [];
  for (let f = 0; f < TOTAL_FLOORS; f++) {
    let free = 0;
    for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
      if (occupancy[f][s] === 0 && slotCategories[f][s] !== 'Out of Service') {
        free++;
      }
    }
    availableCounts[f] = free;
  }

  // Historical Records (Includes active sessions with exitTimestamp: null + completed past sessions)
  const historyRecords: ParkingHistoryRecord[] = [
    // Active sessions:
    ...activeVehicles.map((v, idx) => ({
      id: `HIST-ACT-${idx + 1}`,
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      parkingCategory: v.parkingCategory,
      ownerName: v.ownerName,
      contactNumber: v.contactNumber,
      floorNumber: v.floorNumber,
      slotNumber: v.slotNumber,
      entryTimestamp: v.entryTimestamp,
      exitTimestamp: null,
      parkingDurationMinutes: null
    })),
    // Past completed sessions:
    {
      id: 'HIST-PAST-101',
      registrationNumber: 'TN-58-PAST-101',
      vehicleType: 'Car',
      parkingCategory: 'Normal',
      ownerName: 'N. Senthil Nathan',
      contactNumber: '9842100010',
      floorNumber: 1,
      slotNumber: 6,
      entryTimestamp: getPastTime(300),
      exitTimestamp: getPastTime(180),
      parkingDurationMinutes: 120,
      parkingFee: 60
    },
    {
      id: 'HIST-PAST-102',
      registrationNumber: 'TN-59-PAST-202',
      vehicleType: 'Car',
      parkingCategory: 'VIP',
      ownerName: 'Guest Speaker (AI Seminar)',
      contactNumber: '9842100011',
      floorNumber: 1,
      slotNumber: 2,
      entryTimestamp: getPastTime(240),
      exitTimestamp: getPastTime(90),
      parkingDurationMinutes: 150,
      parkingFee: 0
    },
    {
      id: 'HIST-PAST-103',
      registrationNumber: 'TN-58-PAST-303',
      vehicleType: 'Motorcycle',
      parkingCategory: 'Normal',
      ownerName: 'Priya Dharshini',
      contactNumber: '9842100012',
      floorNumber: 2,
      slotNumber: 3,
      entryTimestamp: getPastTime(150),
      exitTimestamp: getPastTime(60),
      parkingDurationMinutes: 90,
      parkingFee: 20
    },
    {
      id: 'HIST-PAST-104',
      registrationNumber: 'TN-67-PAST-404',
      vehicleType: 'Car',
      parkingCategory: 'Electric Vehicle',
      ownerName: 'G. Balasubramanian',
      contactNumber: '9842100013',
      floorNumber: 2,
      slotNumber: 1,
      entryTimestamp: getPastTime(210),
      exitTimestamp: getPastTime(45),
      parkingDurationMinutes: 165,
      parkingFee: 80
    },
    {
      id: 'HIST-PAST-105',
      registrationNumber: 'TN-58-PAST-505',
      vehicleType: 'Other',
      parkingCategory: 'Normal',
      ownerName: 'College Delivery Van',
      contactNumber: '9842100014',
      floorNumber: 4,
      slotNumber: 1,
      entryTimestamp: getPastTime(100),
      exitTimestamp: getPastTime(15),
      parkingDurationMinutes: 85,
      parkingFee: 40
    }
  ];

  // Waiting Queue: At least 2 vehicles waiting in FIFO queue
  const waitingQueue: WaitingVehicle[] = [
    {
      queueId: 'QUEUE-001',
      registrationNumber: 'TN-58-WQ-7711',
      vehicleType: 'Car',
      parkingCategory: 'Normal',
      ownerName: 'A. Ramanathan',
      contactNumber: '9842100021',
      arrivalTime: getPastTime(12)
    },
    {
      queueId: 'QUEUE-002',
      registrationNumber: 'TN-59-WQ-9922',
      vehicleType: 'Car',
      parkingCategory: 'Electric Vehicle',
      ownerName: 'Deepa Lakshmi',
      contactNumber: '9842100022',
      arrivalTime: getPastTime(5)
    }
  ];

  // Recent Exits Stack: At least 3 recent exits
  const recentExits: ExitRecord[] = [
    {
      id: 'EXIT-001',
      registrationNumber: 'TN-58-PAST-505',
      vehicleType: 'Other',
      parkingCategory: 'Normal',
      floorNumber: 4,
      slotNumber: 1,
      entryTimestamp: getPastTime(100),
      exitTimestamp: getPastTime(15),
      parkingDurationMinutes: 85,
      reallocatedToWaitingVehicle: null
    },
    {
      id: 'EXIT-002',
      registrationNumber: 'TN-67-PAST-404',
      vehicleType: 'Car',
      parkingCategory: 'Electric Vehicle',
      floorNumber: 2,
      slotNumber: 1,
      entryTimestamp: getPastTime(210),
      exitTimestamp: getPastTime(45),
      parkingDurationMinutes: 165,
      reallocatedToWaitingVehicle: null
    },
    {
      id: 'EXIT-003',
      registrationNumber: 'TN-58-PAST-303',
      vehicleType: 'Motorcycle',
      parkingCategory: 'Normal',
      floorNumber: 2,
      slotNumber: 3,
      entryTimestamp: getPastTime(150),
      exitTimestamp: getPastTime(60),
      parkingDurationMinutes: 90,
      reallocatedToWaitingVehicle: null
    }
  ];

  return {
    version: '1.0.0',
    occupancy,
    slotCategories,
    availableCounts,
    activeVehicles,
    historyRecords,
    waitingQueue,
    recentExits,
    totalServedCount: 11 // 6 active + 5 completed
  };
}

/**
 * Loads data from LocalStorage or falls back to demo data
 */
export function loadParkingData(): StorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = getInitialDemoData();
      saveParkingData(demo);
      return demo;
    }
    const parsed = JSON.parse(raw) as StorageSchema;
    // Validate schema integrity
    if (
      !parsed.occupancy ||
      !parsed.slotCategories ||
      !Array.isArray(parsed.activeVehicles) ||
      !Array.isArray(parsed.historyRecords) ||
      !Array.isArray(parsed.waitingQueue) ||
      !Array.isArray(parsed.recentExits)
    ) {
      console.warn('Corrupted parking data in LocalStorage. Resetting to demo data.');
      const demo = getInitialDemoData();
      saveParkingData(demo);
      return demo;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load parking data:', err);
    const demo = getInitialDemoData();
    saveParkingData(demo);
    return demo;
  }
}

/**
 * Persists data to LocalStorage
 */
export function saveParkingData(data: StorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save parking data to LocalStorage:', err);
  }
}

/**
 * Resets storage to clean demo data
 */
export function resetToDemoData(): StorageSchema {
  const demo = getInitialDemoData();
  saveParkingData(demo);
  return demo;
}
