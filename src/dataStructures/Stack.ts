/**
 * Stack (LIFO - Last In, First Out) Data Structure
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Used for: Tracking Recent Vehicle Exits
 * Time Complexities:
 * - Push: O(1)
 * - Pop: O(1)
 * - Peek: O(1)
 * - IsEmpty: O(1)
 * - Display / ToArray: O(n)
 */

import { ExitRecord } from '../types';

export class StackNode<T> {
  public data: T;
  public next: StackNode<T> | null;

  constructor(data: T, next: StackNode<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class Stack<T = ExitRecord> {
  private topNode: StackNode<T> | null = null;
  private count: number = 0;
  private readonly capacity: number;

  constructor(capacity: number = 100, initialItems?: T[]) {
    this.capacity = capacity;
    if (initialItems && initialItems.length > 0) {
      // Items provided in bottom-to-top order
      for (const item of initialItems) {
        this.push(item);
      }
    }
  }

  /**
   * Pushes an element onto the top of the stack - O(1)
   */
  public push(element: T): boolean {
    if (this.count >= this.capacity) {
      console.warn('Stack Overflow: Capacity reached');
      return false;
    }
    const newNode = new StackNode<T>(element, this.topNode);
    this.topNode = newNode;
    this.count++;
    return true;
  }

  /**
   * Removes and returns the top element of the stack - O(1)
   */
  public pop(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    const poppedData = this.topNode!.data;
    this.topNode = this.topNode!.next;
    this.count--;
    return poppedData;
  }

  /**
   * Returns the top element without removing it - O(1)
   */
  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.topNode!.data;
  }

  /**
   * Checks if the stack is empty - O(1)
   */
  public isEmpty(): boolean {
    return this.topNode === null;
  }

  /**
   * Returns the current number of elements - O(1)
   */
  public size(): number {
    return this.count;
  }

  /**
   * Returns elements from Top to Bottom as an array for display/serialization - O(n)
   */
  public toArray(): T[] {
    const list: T[] = [];
    let current = this.topNode;
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
   * Returns bottom-to-top array for serialization so it can be re-pushed correctly
   */
  public toSerializationArray(): T[] {
    return this.toArray().reverse();
  }

  /**
   * Clears the stack
   */
  public clear(): void {
    this.topNode = null;
    this.count = 0;
  }

  /**
   * Creates a deep clone of the stack (useful for educational sandbox)
   */
  public clone(): Stack<T> {
    const reversed = this.toArray().reverse();
    return new Stack<T>(this.capacity, reversed);
  }
}
