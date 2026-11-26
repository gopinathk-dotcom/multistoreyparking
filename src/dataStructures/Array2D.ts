/**
 * 2D and 1D Array Parking Matrix Management
 * Thiagarajar College of Engineering - Department of Information Technology
 * 
 * Demonstrates:
 * - 2D Array: parking[floor][slot] -> 0 = Empty, 1 = Occupied
 * - 1D Array: availableSlotsPerFloor[floor] -> counts of usable empty slots per floor
 * - 2D Slot Categories: slotCategories[floor][slot] -> 'Normal' | 'VIP' | 'Electric Vehicle' | 'Disabled' | 'Out of Service'
 * - Constant-time O(1) direct slot indexing via parking[f][s]
 */

import { AllocationTraceStep, ParkingCategory, SlotCategory } from '../types';

export const TOTAL_FLOORS = 5;
export const SLOTS_PER_FLOOR = 10;
export const TOTAL_SLOTS = TOTAL_FLOORS * SLOTS_PER_FLOOR; // 50

export class ParkingArrayGrid {
  // 2D Array for binary occupancy: 0 = Empty, 1 = Occupied
  // Dimensions: [TOTAL_FLOORS][SLOTS_PER_FLOOR]
  public occupancy: number[][];

  // 1D Array for floor-wise available slot counts
  // Dimensions: [TOTAL_FLOORS]
  public availableCounts: number[];

  // 2D Array for slot reservation categories
  public slotCategories: SlotCategory[][];

  constructor(
    savedOccupancy?: number[][],
    savedCategories?: SlotCategory[][],
    savedAvailableCounts?: number[]
  ) {
    if (savedOccupancy && savedCategories) {
      this.occupancy = savedOccupancy.map(row => [...row]);
      this.slotCategories = savedCategories.map(row => [...row]);
      this.availableCounts = savedAvailableCounts 
        ? [...savedAvailableCounts]
        : this.calculateAllAvailableCounts();
    } else {
      // Default initialization: 5 floors × 10 slots
      this.occupancy = Array.from({ length: TOTAL_FLOORS }, () =>
        Array.from({ length: SLOTS_PER_FLOOR }, () => 0)
      );

      // Default slot categories: Normal everywhere, with some designated VIP, EV, Disabled
      this.slotCategories = Array.from({ length: TOTAL_FLOORS }, (_, floorIdx) => {
        return Array.from({ length: SLOTS_PER_FLOOR }, (_, slotIdx) => {
          // Preset educational layout
          if (floorIdx === 0 && slotIdx === 0) return 'VIP';
          if (floorIdx === 0 && slotIdx === 1) return 'VIP';
          if (floorIdx === 0 && slotIdx === 2) return 'Disabled';
          if (floorIdx === 0 && slotIdx === 3) return 'Electric Vehicle';
          if (floorIdx === 1 && slotIdx === 0) return 'Electric Vehicle';
          if (floorIdx === 4 && slotIdx === 9) return 'Out of Service';
          return 'Normal';
        });
      });

      this.availableCounts = this.calculateAllAvailableCounts();
    }
  }

  /**
   * Recalculates the 1D available slot count array for all floors
   */
  public calculateAllAvailableCounts(): number[] {
    const counts: number[] = [];
    for (let f = 0; f < TOTAL_FLOORS; f++) {
      let free = 0;
      for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
        const cat = this.slotCategories[f][s];
        // Usable empty slot if not occupied and not out of service
        if (this.occupancy[f][s] === 0 && cat !== 'Out of Service') {
          free++;
        }
      }
      counts[f] = free;
    }
    return counts;
  }

  /**
   * Updates availability count for a specific floor - O(slots)
   */
  public refreshFloorAvailableCount(floorIndex: number): void {
    if (floorIndex < 0 || floorIndex >= TOTAL_FLOORS) return;
    let free = 0;
    for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
      const cat = this.slotCategories[floorIndex][s];
      if (this.occupancy[floorIndex][s] === 0 && cat !== 'Out of Service') {
        free++;
      }
    }
    this.availableCounts[floorIndex] = free;
  }

  /**
   * Marks a slot as occupied (1) - O(1)
   */
  public occupySlot(floorNumber: number, slotNumber: number): boolean {
    const f = floorNumber - 1;
    const s = slotNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS || s < 0 || s >= SLOTS_PER_FLOOR) {
      return false;
    }
    this.occupancy[f][s] = 1;
    this.refreshFloorAvailableCount(f);
    return true;
  }

  /**
   * Marks a slot as empty (0) - O(1)
   */
  public vacateSlot(floorNumber: number, slotNumber: number): boolean {
    const f = floorNumber - 1;
    const s = slotNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS || s < 0 || s >= SLOTS_PER_FLOOR) {
      return false;
    }
    this.occupancy[f][s] = 0;
    this.refreshFloorAvailableCount(f);
    return true;
  }

  /**
   * Updates the category of a slot (Only allowed when slot is empty) - O(1)
   */
  public setSlotCategory(floorNumber: number, slotNumber: number, category: SlotCategory): boolean {
    const f = floorNumber - 1;
    const s = slotNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS || s < 0 || s >= SLOTS_PER_FLOOR) {
      return false;
    }
    // Prevent modifying occupied slot directly
    if (this.occupancy[f][s] === 1) {
      return false;
    }
    this.slotCategories[f][s] = category;
    this.refreshFloorAvailableCount(f);
    return true;
  }

  /**
   * Explicit check if a specific floor is full (no usable empty slots) - O(1) using 1D array
   */
  public isFloorFull(floorNumber: number): boolean {
    const f = floorNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS) return true;
    return this.availableCounts[f] === 0;
  }

  /**
   * Explicit check if entire parking lot is full - O(floors)
   */
  public isParkingFull(): boolean {
    return this.availableCounts.every(count => count === 0);
  }

  /**
   * Returns available slot count for a floor - O(1)
   */
  public getAvailableSlots(floorNumber: number): number {
    const f = floorNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS) return 0;
    return this.availableCounts[f];
  }

  /**
   * Returns total usable slots for a floor (excluding Out of Service)
   */
  public getUsableSlotsCount(floorNumber: number): number {
    const f = floorNumber - 1;
    if (f < 0 || f >= TOTAL_FLOORS) return 0;
    let usable = 0;
    for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
      if (this.slotCategories[f][s] !== 'Out of Service') {
        usable++;
      }
    }
    return usable;
  }

  /**
   * Returns floor occupancy percentage = occupied usable slots / usable slots * 100
   */
  public getFloorOccupancy(floorNumber: number): number {
    const usable = this.getUsableSlotsCount(floorNumber);
    if (usable === 0) return 0;
    const f = floorNumber - 1;
    let occupied = 0;
    for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
      if (this.occupancy[f][s] === 1 && this.slotCategories[f][s] !== 'Out of Service') {
        occupied++;
      }
    }
    return Math.round((occupied / usable) * 100);
  }

  /**
   * Returns overall parking occupancy percentage
   */
  public getOverallOccupancy(): number {
    let totalUsable = 0;
    let totalOccupied = 0;
    for (let f = 0; f < TOTAL_FLOORS; f++) {
      for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
        if (this.slotCategories[f][s] !== 'Out of Service') {
          totalUsable++;
          if (this.occupancy[f][s] === 1) {
            totalOccupied++;
          }
        }
      }
    }
    if (totalUsable === 0) return 0;
    return Math.round((totalOccupied / totalUsable) * 100);
  }

  /**
   * Checks slot compatibility based on parking category and slot category
   */
  public isSlotCompatible(slotCat: SlotCategory, vehicleCat: ParkingCategory): boolean {
    if (slotCat === 'Out of Service') return false;

    switch (vehicleCat) {
      case 'Normal':
        // Normal vehicles MUST NEVER occupy reserved slots
        return slotCat === 'Normal';

      case 'VIP':
        // VIP can use VIP slot or normal slot if VIP is not available
        return slotCat === 'VIP' || slotCat === 'Normal';

      case 'Electric Vehicle':
        // EV prefers EV slot or can use Normal slot
        return slotCat === 'Electric Vehicle' || slotCat === 'Normal';

      case 'Disabled':
        // Disabled prefers Disabled slot or can use Normal slot
        return slotCat === 'Disabled' || slotCat === 'Normal';

      default:
        return slotCat === 'Normal';
    }
  }

  /**
   * Core Parking Allocation Algorithm:
   * - Searches floors from lowest (1) to highest (5)
   * - Within each floor, searches slots from lowest (1) to highest (10)
   * - Respects category matching & preference hierarchy
   * - Produces educational step-by-step trace of every floor and slot examined
   */
  public findFirstAvailableSlot(vehicleCategory: ParkingCategory): {
    floor: number | null;
    slot: number | null;
    trace: AllocationTraceStep[];
  } {
    const trace: AllocationTraceStep[] = [];

    // Phase 1 for VIP / EV / Disabled: Try to find a dedicated designated slot first
    if (vehicleCategory !== 'Normal') {
      const preferredCategory: SlotCategory = 
        vehicleCategory === 'VIP' ? 'VIP' :
        vehicleCategory === 'Electric Vehicle' ? 'Electric Vehicle' :
        'Disabled';

      for (let f = 0; f < TOTAL_FLOORS; f++) {
        for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
          const currentCat = this.slotCategories[f][s];
          const isOccupied = this.occupancy[f][s] === 1;

          if (currentCat === preferredCategory) {
            if (isOccupied) {
              trace.push({
                floor: f + 1,
                slot: s + 1,
                status: 'occupied',
                message: `Floor ${f + 1}, Slot ${s + 1} (${currentCat}) is already occupied.`
              });
            } else {
              trace.push({
                floor: f + 1,
                slot: s + 1,
                status: 'allocated',
                message: `Match found! Floor ${f + 1}, Slot ${s + 1} (${currentCat}) is vacant and assigned.`
              });
              return { floor: f + 1, slot: s + 1, trace };
            }
          }
        }
      }
    }

    // Phase 2: Standard search from lowest floor (1) to highest (5), lowest slot (1) to highest (10)
    for (let f = 0; f < TOTAL_FLOORS; f++) {
      // Educational trace if floor has 0 available slots
      if (this.availableCounts[f] === 0) {
        trace.push({
          floor: f + 1,
          slot: 0,
          status: 'skipped_floor_full',
          message: `Floor ${f + 1} is completely full (availableCounts[${f}] = 0). Skipping to Floor ${f + 2}.`
        });
        continue;
      }

      for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
        const slotCat = this.slotCategories[f][s];
        const isOccupied = this.occupancy[f][s] === 1;

        if (slotCat === 'Out of Service') {
          trace.push({
            floor: f + 1,
            slot: s + 1,
            status: 'out_of_service',
            message: `Floor ${f + 1}, Slot ${s + 1} is Out of Service. Skipping.`
          });
          continue;
        }

        if (isOccupied) {
          trace.push({
            floor: f + 1,
            slot: s + 1,
            status: 'occupied',
            message: `Floor ${f + 1}, Slot ${s + 1} is occupied (value = 1). Checking next slot.`
          });
          continue;
        }

        // Slot is empty. Check category compatibility
        if (this.isSlotCompatible(slotCat, vehicleCategory)) {
          trace.push({
            floor: f + 1,
            slot: s + 1,
            status: 'allocated',
            message: `Eligible slot found! Floor ${f + 1}, Slot ${s + 1} (Category: ${slotCat}) allocated.`
          });
          return { floor: f + 1, slot: s + 1, trace };
        } else {
          trace.push({
            floor: f + 1,
            slot: s + 1,
            status: 'wrong_category',
            message: `Floor ${f + 1}, Slot ${s + 1} is reserved for ${slotCat}. Incompatible with ${vehicleCategory}.`
          });
        }
      }
    }

    return { floor: null, slot: null, trace };
  }

  /**
   * Suggests the best eligible floor for an incoming vehicle category
   * Considers actual compatible slot count on each floor, not just raw capacity.
   */
  public suggestBestFloor(vehicleCategory: ParkingCategory): {
    bestFloor: number | null;
    compatibleSlots: number;
    reason: string;
  } {
    let maxCompatible = -1;
    let bestFloor: number | null = null;

    for (let f = 0; f < TOTAL_FLOORS; f++) {
      let compatibleCount = 0;
      for (let s = 0; s < SLOTS_PER_FLOOR; s++) {
        if (
          this.occupancy[f][s] === 0 &&
          this.isSlotCompatible(this.slotCategories[f][s], vehicleCategory)
        ) {
          compatibleCount++;
        }
      }

      if (compatibleCount > maxCompatible && compatibleCount > 0) {
        maxCompatible = compatibleCount;
        bestFloor = f + 1;
      }
    }

    if (bestFloor === null) {
      return {
        bestFloor: null,
        compatibleSlots: 0,
        reason: `No eligible slots available for ${vehicleCategory} vehicles on any floor.`
      };
    }

    return {
      bestFloor,
      compatibleSlots: maxCompatible,
      reason: `Floor ${bestFloor} has the highest number of eligible vacant slots (${maxCompatible}) for ${vehicleCategory}.`
    };
  }

  /**
   * Identifies floors with maximum and minimum available slots
   * Handles ties by returning an array of floors.
   */
  public getExtremeFloors(): {
    maxAvailableFloors: number[];
    maxAvailableCount: number;
    minAvailableFloors: number[];
    minAvailableCount: number;
  } {
    let max = -1;
    let min = Infinity;

    for (let f = 0; f < TOTAL_FLOORS; f++) {
      const count = this.availableCounts[f];
      if (count > max) max = count;
      if (count < min) min = count;
    }

    const maxAvailableFloors: number[] = [];
    const minAvailableFloors: number[] = [];

    for (let f = 0; f < TOTAL_FLOORS; f++) {
      if (this.availableCounts[f] === max) {
        maxAvailableFloors.push(f + 1);
      }
      if (this.availableCounts[f] === min) {
        minAvailableFloors.push(f + 1);
      }
    }

    return {
      maxAvailableFloors,
      maxAvailableCount: max,
      minAvailableFloors,
      minAvailableCount: min === Infinity ? 0 : min
    };
  }
}
