/**
 * Vehicle Entry Database Engine
 * Handles persistent database storage, transactional commits, and real-time synchronization
 * for vehicle entry lists and slot allocations.
 */

import { ActiveVehicleNodeData, ExitRecord } from '../types';
import { loadParkingData } from './storageService';
import { indexedDbEngine, DbVehicleEntryRecord } from './indexedDbService';

export interface DatabaseStatus {
  isConnected: boolean;
  engine: 'IndexedDB + LocalStorage Dual Layer';
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastSyncTimestamp: string;
  totalRecords: number;
  activeVehiclesCount: number;
}

export interface DbTransaction {
  id: string;
  type: 'INSERT_ENTRY' | 'VACATE_EXIT' | 'ENQUEUE_WAITLIST' | 'UPDATE_RESERVATION' | 'RESTORE';
  timestamp: string;
  registrationNumber?: string;
  details: string;
}

class ParkingDatabaseService {
  private transactions: DbTransaction[] = [];
  private isConnected: boolean = true;
  private lastSyncTime: string = new Date().toISOString();

  constructor() {
    this.logTransaction('RESTORE', 'Database initialized and connected to persistent IndexedDB engine.');
  }

  public getConnectionStatus(): DatabaseStatus {
    const data = loadParkingData();
    return {
      isConnected: this.isConnected,
      engine: 'IndexedDB + LocalStorage Dual Layer',
      status: this.isConnected ? 'ONLINE' : 'OFFLINE',
      lastSyncTimestamp: this.lastSyncTime,
      totalRecords: (data.activeVehicles?.length || 0) + (data.historyRecords?.length || 0),
      activeVehiclesCount: data.activeVehicles?.length || 0
    };
  }

  public logTransaction(type: DbTransaction['type'], details: string, registrationNumber?: string): DbTransaction {
    const tx: DbTransaction = {
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      registrationNumber,
      details
    };
    this.transactions.unshift(tx);
    if (this.transactions.length > 50) {
      this.transactions.pop();
    }
    this.lastSyncTime = tx.timestamp;

    // Also persist audit record to IndexedDB
    indexedDbEngine.logTransaction(type, details, registrationNumber);

    return tx;
  }

  public getRecentTransactions(): DbTransaction[] {
    return [...this.transactions];
  }

  /**
   * Commits a new vehicle entry to persistent database (IndexedDB + Storage)
   */
  public commitVehicleEntry(record: ActiveVehicleNodeData): { success: boolean; tx: DbTransaction } {
    const tx = this.logTransaction(
      'INSERT_ENTRY',
      `Vehicle ${record.registrationNumber} committed to Floor ${record.floorNumber}, Slot ${record.slotNumber}.`,
      record.registrationNumber
    );

    // Save to IndexedDB asynchronous store
    indexedDbEngine.saveVehicleEntry(record).catch(console.warn);

    return { success: true, tx };
  }

  /**
   * Commits a vehicle exit and slot vacation to persistent database
   */
  public commitVehicleExit(record: ExitRecord): { success: boolean; tx: DbTransaction } {
    const tx = this.logTransaction(
      'VACATE_EXIT',
      `Vehicle ${record.registrationNumber} exited from Floor ${record.floorNumber}, Slot ${record.slotNumber} (Duration: ${record.parkingDurationMinutes} mins).`,
      record.registrationNumber
    );

    // Update status in IndexedDB
    indexedDbEngine.markVehicleExited(record.registrationNumber).catch(console.warn);

    return { success: true, tx };
  }

  /**
   * Sync initial loaded records to IndexedDB
   */
  public syncActiveVehicles(records: ActiveVehicleNodeData[]): void {
    indexedDbEngine.syncInitialEntries(records).catch(console.warn);
  }
}

export const dbService = new ParkingDatabaseService();
