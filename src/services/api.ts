
import axios from "axios";
import { User, Vehicle, SlotRequest, ParkingSlot, PaginatedResponse } from "@/types";
import { normalizePaginatedResponse } from "@/utils/Pagination";


const API_URL = "http://localhost:5000"; // Update this to match your backend URL

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/user/auth/login", { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/user/auth/register", { name, email, password });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true };
  },

  validateToken: async () => {
    const response = await api.get("/user/auth/validate");
    return response.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put("/user/auth/update", userData);
    return response.data;
  }
};

// Vehicle API
export const vehicleApi = {
  getVehicles: async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/vehicle", { 
    params: { page, limit, search } 
  });
  console.log("respons",response);
  
   return normalizePaginatedResponse<Vehicle>(response.data, page, limit);
},

  createVehicle: async (vehicleData: Omit<Vehicle, "id" | "userId">) => {
    const response = await api.post<Vehicle>("/vehicle/add", vehicleData);
    return response.data;
  },

  updateVehicle: async (id: number, vehicleData: Partial<Vehicle>) => {
    const response = await api.put<Vehicle>(`/vehicle/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id: number) => {
    const response = await api.delete(`/vehicle/${id}`);
    return response.data;
  }
};

// Slot Request API
export const slotRequestApi = {
  getRequests: async (page = 1, limit = 10, status?: string) => {
    const response = await api.get<PaginatedResponse<SlotRequest>>("/user/slot", { 
      params: { page, limit, status } 
    });

    console.log("slot requests",response);
    
    return normalizePaginatedResponse<SlotRequest>(response.data, page, limit);
  },

  createRequest: async (vehicleId: number, slotId: number) => {
    const response = await api.post("/user/slot/request", { vehicleId, slotId });
    return response.data;
  },

  updateRequestStatus: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.put(`/user/slot/${id}`, { requestStatus: status });
    return response.data;
  },

 approveRequest: async (
  id: number,
  slotId: number,
  plateNumber: string,
  status: 'APPROVED' | 'REJECTED' = 'APPROVED'
) => {
  const response = await api.post(`/user/slot/${id}/approve`, {
    slotId,
    plateNumber,
    status,
  });
  return response.data;
},


  deleteRequest: async (id: number) => {
    const response = await api.delete(`/user/slot/${id}`);
    return response.data;
  }
};

// Parking Slot API
export const parkingSlotApi = {
  getSlots: async (page = 1, limit = 10000, filters = {}) => {
    const response = await api.get<PaginatedResponse<ParkingSlot>>("/slots", { 
      params: { page, limit, ...filters } 
    });
    return normalizePaginatedResponse<ParkingSlot>(response.data, page, limit);
  },

  createSlot: async (slotData: Omit<ParkingSlot, "id">) => {
    const response = await api.post("/slots/create", slotData);
    return response.data;
  },

  createSlotsInBulk: async (
    count: number,
    baseNumber: string,
    size: string,
    vehicleType: string,
    location: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  ) => {
    const response = await api.post("/slots/create/bulk", {
      count,
      baseNumber,
      size,
      vehicleType,
      location
    });
    return response.data;
  },

  updateSlot: async (id: number, slotData: Partial<ParkingSlot>) => {
    const response = await api.put(`/slots/${id}`, slotData);
    return response.data;
  },

  deleteSlot: async (id: number) => {
    const response = await api.delete(`/slots/${id}`);
    return response.data;
  }
};
