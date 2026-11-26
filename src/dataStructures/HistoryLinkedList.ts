/**
 * Linked List Implementation for Parking History
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Demonstrates:
 * - Persistent transaction auditing via linked nodes
 * - Update-in-place upon exit (preserving node references)
 * - Filtering and reverse-chronological display
 */

import { ParkingHistoryRecord } from '../types';

export class HistoryNode {
  public data: ParkingHistoryRecord;
  public next: HistoryNode | null;

  constructor(data: ParkingHistoryRecord, next: HistoryNode | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class ParkingHistoryLinkedList {
  private head: HistoryNode | null = null;
  private count: number = 0;

  constructor(initialRecords?: ParkingHistoryRecord[]) {
    if (initialRecords && initialRecords.length > 0) {
      // Reconstruct preserving order
      for (const item of initialRecords) {
        this.addRecordTail(item);
      }
    }
  }

  /**
   * Adds a new history record at head (newest first) - O(1)
   */
  public addRecordHead(data: ParkingHistoryRecord): HistoryNode {
    const newNode = new HistoryNode(data, this.head);
    this.head = newNode;
    this.count++;
    return newNode;
  }

  /**
   * Adds record at tail (useful when restoring historical stream) - O(n)
   */
  public addRecordTail(data: ParkingHistoryRecord): HistoryNode {
    const newNode = new HistoryNode(data, null);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.count++;
    return newNode;
  }

  /**
   * Updates an active parking record when vehicle exits - O(n)
   */
  public markExit(
    registrationNumber: string,
    exitTimestamp: string,
    durationMinutes: number,
    fee?: number
  ): ParkingHistoryRecord | null {
    const cleanReg = registrationNumber.trim().toUpperCase();
    let current = this.head;
    
    // Find the latest active record for this registration (exitTimestamp === null)
    while (current !== null) {
      if (
        current.data.registrationNumber.toUpperCase() === cleanReg &&
        current.data.exitTimestamp === null
      ) {
        current.data.exitTimestamp = exitTimestamp;
        current.data.parkingDurationMinutes = durationMinutes;
        if (fee !== undefined) {
          current.data.parkingFee = fee;
        }
        return { ...current.data };
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Search all historical sessions for a given registration number - O(n)
   */
  public searchByRegistration(registrationNumber: string): ParkingHistoryRecord[] {
    const cleanReg = registrationNumber.trim().toUpperCase();
    const results: ParkingHistoryRecord[] = [];
    let current = this.head;
    while (current !== null) {
      if (current.data.registrationNumber.toUpperCase().includes(cleanReg)) {
        results.push({ ...current.data });
      }
      current = current.next;
    }
    return results;
  }

  /**
   * Returns all records as an array - O(n)
   */
  public toArray(): ParkingHistoryRecord[] {
    const results: ParkingHistoryRecord[] = [];
    let current = this.head;
    while (current !== null) {
      results.push({ ...current.data });
      current = current.next;
    }
    return results;
  }

  /**
   * Filter records by floor, status (active/completed), and date
   */
  public filter(filters: {
    floor?: number;
    status?: 'all' | 'active' | 'completed';
    search?: string;
  }): ParkingHistoryRecord[] {
    const all = this.toArray();
    return all.filter((rec) => {
      if (filters.floor && filters.floor !== 0 && rec.floorNumber !== filters.floor) {
        return false;
      }
      if (filters.status === 'active' && rec.exitTimestamp !== null) {
        return false;
      }
      if (filters.status === 'completed' && rec.exitTimestamp === null) {
        return false;
      }
      if (filters.search) {
        const query = filters.search.trim().toUpperCase();
        const matchesReg = rec.registrationNumber.toUpperCase().includes(query);
        const matchesOwner = rec.ownerName?.toUpperCase().includes(query) ?? false;
        if (!matchesReg && !matchesOwner) {
          return false;
        }
      }
      return true;
    });
  }

  public size(): number {
    return this.count;
  }

  public getHead(): HistoryNode | null {
    return this.head;
  }

  public clear(): void {
    this.head = null;
    this.count = 0;
  }
}
