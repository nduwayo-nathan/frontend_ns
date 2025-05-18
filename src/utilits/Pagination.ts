import { PaginatedResponse } from "@/types";

// utils/pagination.ts
export function normalizePaginatedResponse<T>(
  response: any,
  page: number,
  limit: number
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    const total = response.length;
    // slice response for current page
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: response.slice(start, end),
      meta: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        itemsPerPage: limit,
      },
    };
  }

  return {
    data: response.items || response.vehicles || [],
    meta:
      response.meta || {
        total: response.totalCount || 0,
        currentPage: page,
        totalPages: response.totalPages || 1,
        itemsPerPage: limit,
      },
  };
}
