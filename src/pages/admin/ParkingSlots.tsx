import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parkingSlotApi } from "@/services/api";
import { ParkingSlot, ApiResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";

const ParkingSlots: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [pageInput, setPageInput] = useState("");

  // Sanitize search input to prevent XSS and SQL injection
 const sanitizeSearchInput = (input: string): string => {
  // Remove any HTML tags
  const sanitized = input.replace(/<[^>]*>?/gm, '');
  // Normalize whitespace (replace multiple spaces with single space)
  const normalized = sanitized.replace(/\s+/g, ' ').trim();
  // Escape special regex characters to prevent regex injection
  return normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

  // Filter slots based on sanitized search term
  const filterSlots = (slots: ParkingSlot[], searchTerm: string): ParkingSlot[] => {
    if (!searchTerm.trim()) return slots;
    
    const term = sanitizeSearchInput(searchTerm.toLowerCase());
    try {
      const regex = new RegExp(term, 'i');
      return slots.filter(slot => 
        regex.test(slot.slotNumber.toLowerCase()) ||
        regex.test(slot.location.toLowerCase()) ||
        regex.test(slot.size.toLowerCase()) ||
        regex.test(slot.vehicleType.toLowerCase()) ||
        regex.test(slot.status.toLowerCase())
      );
    } catch (e) {
      console.error("Invalid search regex:", e);
      return slots;
    }
  };

  // Fetch all parking slots
  const { 
    data: slotsData, 
    isLoading,
    isError,
    error,
    isPreviousData 
  } = useQuery<ApiResponse>({
    queryKey: ["adminParkingSlots"],
    queryFn: async () => {
      const response = await parkingSlotApi.getSlots();
      return {
        data: response.data,
        meta: {
          total: response.data.length,
        }
      };
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  // Apply search filter to the data
  const allSlots = slotsData?.data || [];
  const filteredSlots = search ? filterSlots(allSlots, search) : allSlots;
  const totalSlots = filteredSlots.length;
  const totalPages = Math.ceil(totalSlots / pageSize);
  
  // Get current page slots
  const currentPageSlots = filteredSlots.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const showingFrom = totalSlots > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(page * pageSize, totalSlots);

  // Mutation to delete a slot
  const deleteSlotMutation = useMutation({
    mutationFn: (id: number) => parkingSlotApi.deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminParkingSlots"] });
      toast({
        title: "Slot Deleted",
        description: "The parking slot has been deleted successfully.",
      });
      
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (currentPageSlots.length === 1 && page > 1) {
        setPage(page - 1);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete parking slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Handle page input submit
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(pageInput);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
    setPageInput("");
  };

  // Handle search change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Parking Slots</h1>
          <p className="text-muted-foreground">
            Manage parking slots in your facility
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle>All Parking Slots</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search slots..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 max-w-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !isPreviousData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="sr-only">Loading slots...</span>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center py-12 text-destructive">
              Error: {error instanceof Error ? error.message : "Failed to load slots"}
            </div>
          ) : currentPageSlots.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot Number</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageSlots.map((slot: ParkingSlot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                        <TableCell>{slot.location}</TableCell>
                        <TableCell>
                          <span className="capitalize">{slot.size}</span>
                        </TableCell>
                        <TableCell className="capitalize">{slot.vehicleType}</TableCell>
                        <TableCell>
                          {slot.status === "AVAILABLE" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Occupied
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSlotMutation.mutate(slot.id)}
                            disabled={deleteSlotMutation.isPending}
                          >
                            {deleteSlotMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {totalSlots > 0 ? (
                    <>
                      Showing <span className="font-medium">{showingFrom}</span> to{' '}
                      <span className="font-medium">{showingTo}</span> of{' '}
                      <span className="font-medium">{totalSlots}</span> slots
                    </>
                  ) : (
                    search ? "No matching slots found" : "No slots available"
                  )}
                </div>
                
                {totalSlots > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[5, 10, 20, 30, 40, 50].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(1)}
                        disabled={page === 1 || isLoading}
                      >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1 || isLoading}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages || isLoading}
                      >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(totalPages)}
                        disabled={page >= totalPages || isLoading}
                      >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageInput}
                        onChange={handlePageInputChange}
                        className="w-16 text-center"
                        placeholder="Page"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        variant="outline"
                        disabled={isLoading}
                      >
                        Go
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-gray-500">
                {search ? "No parking slots match your search" : "No parking slots available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingSlots;