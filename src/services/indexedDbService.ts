/**
 * IndexedDB Client-Side Database Engine
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Provides real persistent browser database storage using the W3C IndexedDB API:
 * - Object Store 1: 'vehicle_entries' (stores all active & historical vehicle entries)
 * - Object Store 2: 'parking_grid' (stores 2D occupancy matrix and slot categories)
 * - Object Store 3: 'db_transactions' (stores audit trail and database operations)
 */

import { ActiveVehicleNodeData, ExitRecord, ParkingHistoryRecord } from '../types';

const DB_NAME = 'TCE_ParkingManagement_DB';
const DB_VERSION = 1;

export interface DbVehicleEntryRecord extends ActiveVehicleNodeData {
  dbRecordId: string;
  status: 'PARKED' | 'EXITED' | 'WAITING';
  lastUpdated: string;
}

export class IndexedDbEngine {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private isReady: boolean = false;

  constructor() {
    if (this.isSupported) {
      this.initDatabase().catch((err) => {
        console.warn('IndexedDB initialization failed, will fall back to LocalStorage repository:', err);
      });
    }
  }

  /**
   * Initializes the IndexedDB database and creates object stores if needed
   */
  public async initDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (!this.isSupported) {
      throw new Error('IndexedDB is not supported in this browser environment.');
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Vehicle Entries Store
        if (!db.objectStoreNames.contains('vehicle_entries')) {
          const entryStore = db.createObjectStore('vehicle_entries', { keyPath: 'registrationNumber' });
          entryStore.createIndex('floorNumber', 'floorNumber', { unique: false });
          entryStore.createIndex('status', 'status', { unique: false });
          entryStore.createIndex('entryTimestamp', 'entryTimestamp', { unique: false });
        }

        // 2. Parking Grid Store
        if (!db.objectStoreNames.contains('parking_grid')) {
          db.createObjectStore('parking_grid', { keyPath: 'id' });
        }

        // 3. Transactions Audit Store
        if (!db.objectStoreNames.contains('db_transactions')) {
          const txStore = db.createObjectStore('db_transactions', { keyPath: 'id' });
          txStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isReady = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Ensures the database is open before executing queries
   */
  private async ensureDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return await this.initDatabase();
  }

  /**
   * Stores or updates a vehicle in the 'vehicle_entries' object store
   */
  public async saveVehicleEntry(vehicle: ActiveVehicleNodeData): Promise<boolean> {
    try {
      const db = await this.ensureDb();
      return new Promise((resolve) => {
        const tx = db.transaction('vehicle_entries', 'readwrite');
        const store = tx.objectStore('vehicle_entries');

        const record: DbVehicleEntryRecord = {
          ...vehicle,
          dbRecordId: `REC-${Date.now()}-${vehicle.registrationNumber}`,
          status: 'PARKED',
          lastUpdated: new Date().toISOString()
        };

        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Updates a vehicle's status to EXITED upon exit
   */
  public async markVehicleExited(registrationNumber: string): Promise<boolean> {
    try {
      const db = await this.ensureDb();
      return new Promise((resolve) => {
        const tx = db.transaction('vehicle_entries', 'readwrite');
        const store = tx.objectStore('vehicle_entries');
        const getReq = store.get(registrationNumber);

        getReq.onsuccess = () => {
          const data = getReq.result as DbVehicleEntryRecord | undefined;
          if (data) {
            data.status = 'EXITED';
            data.lastUpdated = new Date().toISOString();
            store.put(data);
          }
          resolve(true);
        };
        getReq.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Retrieves all vehicle entry records currently stored in IndexedDB
   */
  public async getAllVehicleEntries(): Promise<DbVehicleEntryRecord[]> {
    try {
      const db = await this.ensureDb();
      return new Promise((resolve) => {
        const tx = db.transaction('vehicle_entries', 'readonly');
        const store = tx.objectStore('vehicle_entries');
        const req = store.getAll();

        req.onsuccess = () => {
          resolve((req.result as DbVehicleEntryRecord[]) || []);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Records a database transaction in the audit log
   */
  public async logTransaction(type: string, details: string, regNo?: string): Promise<void> {
    try {
      const db = await this.ensureDb();
      const tx = db.transaction('db_transactions', 'readwrite');
      const store = tx.objectStore('db_transactions');
      store.add({
        id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        details,
        registrationNumber: regNo,
        timestamp: new Date().toISOString()
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Bulk syncs multiple records into IndexedDB
   */
  public async syncInitialEntries(entries: ActiveVehicleNodeData[]): Promise<void> {
    try {
      const db = await this.ensureDb();
      const tx = db.transaction('vehicle_entries', 'readwrite');
      const store = tx.objectStore('vehicle_entries');

      entries.forEach((v) => {
        const record: DbVehicleEntryRecord = {
          ...v,
          dbRecordId: `REC-INIT-${v.registrationNumber}`,
          status: 'PARKED',
          lastUpdated: new Date().toISOString()
        };
        store.put(record);
      });
    } catch (e) {
      console.warn('Initial entries sync error:', e);
    }
  }
}

export const indexedDbEngine = new IndexedDbEngine();
