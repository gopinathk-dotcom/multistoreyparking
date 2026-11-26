/**
 * Singly Linked List Implementation for Active Parked Vehicles
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Time Complexities:
 * - Insertion (at Head): O(1)
 * - Search by Registration: O(n)
 * - Deletion by Registration: O(n)
 * - Traversal / ToArray: O(n)
 * Space Complexity: O(n) where n is the number of active vehicles
 */

import { ActiveVehicleNodeData } from '../types';

export class ActiveVehicleNode {
  public data: ActiveVehicleNodeData;
  public next: ActiveVehicleNode | null;

  constructor(data: ActiveVehicleNodeData, next: ActiveVehicleNode | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class ActiveVehiclesLinkedList {
  private head: ActiveVehicleNode | null = null;
  private count: number = 0;

  constructor(initialNodes?: ActiveVehicleNodeData[]) {
    if (initialNodes && initialNodes.length > 0) {
      // Reconstruct preserving order
      for (const item of initialNodes) {
        this.insertTail(item);
      }
    }
  }

  /**
   * Inserts a new vehicle at the head of the linked list - O(1)
   */
  public insertHead(data: ActiveVehicleNodeData): ActiveVehicleNode {
    const newNode = new ActiveVehicleNode(data, this.head);
    this.head = newNode;
    this.count++;
    return newNode;
  }

  /**
   * Inserts a new vehicle at the tail of the linked list - O(n) or O(1) with tail pointer
   */
  public insertTail(data: ActiveVehicleNodeData): ActiveVehicleNode {
    const newNode = new ActiveVehicleNode(data, null);
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
   * Searches for a vehicle by registration number (case-insensitive) - O(n)
   */
  public search(registrationNumber: string): ActiveVehicleNode | null {
    const cleanReg = registrationNumber.trim().toUpperCase();
    let current = this.head;
    while (current !== null) {
      if (current.data.registrationNumber.toUpperCase() === cleanReg) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Checks if a vehicle with the given registration is already parked - O(n)
   */
  public contains(registrationNumber: string): boolean {
    return this.search(registrationNumber) !== null;
  }

  /**
   * Finds the vehicle currently occupying a specific floor and slot - O(n)
   */
  public findBySlot(floorNumber: number, slotNumber: number): ActiveVehicleNode | null {
    let current = this.head;
    while (current !== null) {
      if (current.data.floorNumber === floorNumber && current.data.slotNumber === slotNumber) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Deletes a vehicle by registration number - O(n)
   * Returns the removed data, or null if not found
   */
  public delete(registrationNumber: string): ActiveVehicleNodeData | null {
    const cleanReg = registrationNumber.trim().toUpperCase();
    if (!this.head) {
      return null;
    }

    // If head node contains the key
    if (this.head.data.registrationNumber.toUpperCase() === cleanReg) {
      const removedData = this.head.data;
      this.head = this.head.next;
      this.count--;
      return removedData;
    }

    // Traverse to find the node whose next node contains the key
    let current = this.head;
    while (current.next !== null) {
      if (current.next.data.registrationNumber.toUpperCase() === cleanReg) {
        const removedData = current.next.data;
        current.next = current.next.next;
        this.count--;
        return removedData;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Returns the head node for direct pointer visualization
   */
  public getHead(): ActiveVehicleNode | null {
    return this.head;
  }

  /**
   * Returns the count of active vehicles - O(1)
   */
  public size(): number {
    return this.count;
  }

  /**
   * Checks if the list is empty - O(1)
   */
  public isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Converts the linked list into a standard array for rendering and serialization - O(n)
   */
  public toArray(): ActiveVehicleNodeData[] {
    const result: ActiveVehicleNodeData[] = [];
    let current = this.head;
    while (current !== null) {
      result.push({ ...current.data });
      current = current.next;
    }
    return result;
  }

  /**
   * Clears the entire list
   */
  public clear(): void {
    this.head = null;
    this.count = 0;
  }
}
