/**
 * Queue (FIFO - First In, First Out) Data Structure with Front and Rear Pointers
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Used for: Managing Waiting Vehicles Queue
 * Time Complexities:
 * - Enqueue (at Rear): O(1)
 * - Dequeue (from Front): O(1)
 * - Peek (at Front): O(1)
 * - IsEmpty: O(1)
 * - Display / Traversal: O(n)
 */

import { WaitingVehicle } from '../types';

export class QueueNode<T> {
  public data: T;
  public next: QueueNode<T> | null;

  constructor(data: T, next: QueueNode<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class Queue<T = WaitingVehicle> {
  private frontNode: QueueNode<T> | null = null;
  private rearNode: QueueNode<T> | null = null;
  private count: number = 0;

  constructor(initialItems?: T[]) {
    if (initialItems && initialItems.length > 0) {
      for (const item of initialItems) {
        this.enqueue(item);
      }
    }
  }

  /**
   * Adds an element to the rear of the queue - O(1)
   */
  public enqueue(element: T): void {
    const newNode = new QueueNode<T>(element, null);
    if (this.isEmpty()) {
      this.frontNode = newNode;
      this.rearNode = newNode;
    } else {
      this.rearNode!.next = newNode;
      this.rearNode = newNode;
    }
    this.count++;
  }

  /**
   * Removes and returns the front element from the queue - O(1)
   */
  public dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    const dequeuedData = this.frontNode!.data;
    this.frontNode = this.frontNode!.next;
    this.count--;

    if (this.frontNode === null) {
      this.rearNode = null;
    }

    return dequeuedData;
  }

  /**
   * Returns the front element without removing it - O(1)
   */
  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.frontNode!.data;
  }

  /**
   * Checks if the queue is empty - O(1)
   */
  public isEmpty(): boolean {
    return this.frontNode === null;
  }

  /**
   * Returns the number of elements in the queue - O(1)
   */
  public size(): number {
    return this.count;
  }

  /**
   * Returns elements from Front to Rear as an array for display/serialization - O(n)
   */
  public toArray(): T[] {
    const list: T[] = [];
    let current = this.frontNode;
    while (current !== null) {
      list.push(current.data);
      current = current.next;
    }
    return list;
  }

  /**
   * Alias for toArray for college syllabus naming
   */
  public display(): T[] {
    return this.toArray();
  }

  /**
   * Searches for a vehicle in queue by registration number - O(n)
   */
  public searchByRegistration(regNo: string): T | null {
    const clean = regNo.trim().toUpperCase();
    let current = this.frontNode;
    while (current !== null) {
      const v = current.data as unknown as WaitingVehicle;
      if (v?.registrationNumber && v.registrationNumber.toUpperCase() === clean) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Removes a specific item from the queue by registration number (e.g. for cancellation or eligible extraction) - O(n)
   */
  public removeByRegistration(regNo: string): T | null {
    const clean = regNo.trim().toUpperCase();
    if (this.isEmpty()) return null;

    // Check front node
    const frontV = this.frontNode!.data as unknown as WaitingVehicle;
    if (frontV?.registrationNumber && frontV.registrationNumber.toUpperCase() === clean) {
      return this.dequeue();
    }

    // Traverse to find node to delete
    let current = this.frontNode;
    while (current?.next !== null) {
      const nextV = current!.next!.data as unknown as WaitingVehicle;
      if (nextV?.registrationNumber && nextV.registrationNumber.toUpperCase() === clean) {
        const removed = current!.next!.data;
        // If deleting rear
        if (current!.next === this.rearNode) {
          this.rearNode = current;
        }
        current!.next = current!.next!.next;
        this.count--;
        return removed;
      }
      current = current!.next;
    }

    return null;
  }

  /**
   * Clears the queue
   */
  public clear(): void {
    this.frontNode = null;
    this.rearNode = null;
    this.count = 0;
  }

  /**
   * Deep clone for sandbox testing
   */
  public clone(): Queue<T> {
    return new Queue<T>(this.toArray());
  }
}
