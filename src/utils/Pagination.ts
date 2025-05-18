import { PaginatedResponse } from "@/types";

// utils/pagination.ts
export function normalizePaginatedResponse<T>(
  response: any,
  page: number,
  limit: number
): PaginatedResponse<T> {
  // If backend just returns an array
  if (Array.isArray(response)) {
    const total = response.length;
    return {
      data: response,
      meta: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        itemsPerPage: limit
      }
    };
  }

  return {
    data: response.items || response.vehicles || [],
    meta: response.meta || {
      total: response.totalCount || 0,
      currentPage: page,
      totalPages: response.totalPages || 1,
      itemsPerPage: limit
    }
  };
}
