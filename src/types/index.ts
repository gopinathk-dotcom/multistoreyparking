export type VehicleType = 'Car' | 'Motorcycle' | 'Other';

export type ParkingCategory = 'Normal' | 'VIP' | 'Electric Vehicle' | 'Disabled';

export type SlotCategory = 'Normal' | 'VIP' | 'Electric Vehicle' | 'Disabled' | 'Out of Service';

export interface Vehicle {
  registrationNumber: string;
  vehicleType: VehicleType;
  parkingCategory: ParkingCategory;
  ownerName?: string;
  contactNumber?: string;
}

export interface ActiveVehicleNodeData extends Vehicle {
  floorNumber: number; // 1-indexed (Floor 1 - 5)
  slotNumber: number;  // 1-indexed (Slot 1 - 10)
  entryTimestamp: string; // ISO string
}

export interface ParkingHistoryRecord extends Vehicle {
  id: string;
  floorNumber: number;
  slotNumber: number;
  entryTimestamp: string;
  exitTimestamp: string | null;
  parkingDurationMinutes: number | null;
  parkingFee?: number;
}

export interface ExitRecord {
  id: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  parkingCategory: ParkingCategory;
  floorNumber: number;
  slotNumber: number;
  entryTimestamp: string;
  exitTimestamp: string;
  parkingDurationMinutes: number;
  reallocatedToWaitingVehicle?: string | null; // Reg number if given to waitlist
}

export interface WaitingVehicle extends Vehicle {
  queueId: string;
  arrivalTime: string;
}

export interface AllocationTraceStep {
  floor: number;
  slot: number;
  status: 'occupied' | 'wrong_category' | 'out_of_service' | 'allocated' | 'skipped_floor_full';
  message: string;
}

export interface AllocationResult {
  success: boolean;
  floor?: number;
  slot?: number;
  message: string;
  trace: AllocationTraceStep[];
  queued?: boolean;
}

export interface FloorStats {
  floorNumber: number;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  outOfServiceSlots: number;
  occupancyPercentage: number;
}

export type AppTheme = 'royal-slate' | 'modern-light' | 'emerald-dark' | 'twilight-violet';
