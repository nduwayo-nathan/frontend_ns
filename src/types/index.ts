
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleType: string;
  size: string;
  additionalAttributes: Record<string, any>;
}

export interface ParkingSlot {
  id: number;
  slotNumber: string;
  size: string;
  vehicleType: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  location: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
}

export interface SlotRequest {
  id: number;
  requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  userId: number;
  vehicleId: number;
  slotId: number;
  slotNumber: string;
  vehicle?: Vehicle;
}

export interface Log {
  id: number;
  action: string;
  timestamp: string;
  userId: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PaginatedMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

