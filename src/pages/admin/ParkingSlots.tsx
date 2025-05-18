import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parkingSlotApi } from "@/services/api";
import { ParkingSlot } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import {Card,CardContent,CardHeader,CardTitle,} from "@/components/ui/card";
import { Plus,Search,Trash,ChevronLeft,ChevronRight,ChevronsLeft,ChevronsRight,Loader2 } from "lucide-react";

interface CreateSlotFormData {
  slotNumber: string;
  size: "small" | "medium" | "large";
  vehicleType: string;
  location: "NORTH" | "SOUTH" | "EAST" | "WEST";
}

interface CreateBulkSlotsFormData {
  count: number;
  baseNumber: string;
  size: "small" | "medium" | "large";
  vehicleType: string;
  location: "NORTH" | "SOUTH" | "EAST" | "WEST";
}

interface ApiResponse {
  data: ParkingSlot[];
  meta: {
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
  };
}

const ParkingSlots: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [pageInput, setPageInput] = useState("");

  const [newSlot, setNewSlot] = useState<CreateSlotFormData>({
    slotNumber: "",
    size: "medium",
    vehicleType: "car",
    location: "NORTH",
  });

  const [bulkSlots, setBulkSlots] = useState<CreateBulkSlotsFormData>({
    count: 5,
    baseNumber: "A",
    size: "medium",
    vehicleType: "car",
    location: "NORTH",
  });

  // Fetch parking slots with search & pagination
  const { 
    data: slotsData, 
    isLoading,
    isError,
    error,
    isPreviousData 
  } = useQuery<ApiResponse>({
    queryKey: ["adminParkingSlots", page, pageSize, search],
    queryFn: async () => {
      const response = await parkingSlotApi.getSlots(page, pageSize, { search });
      return {
        data: response.data,
        meta: {
          total: response.meta?.total || 0,
          currentPage: page,
          perPage: pageSize,
          lastPage: Math.ceil((response.meta?.total || 0) / pageSize)
        }
      };
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  // Calculate total pages and slots
  const totalPages = slotsData?.meta.lastPage || 0;
  const totalSlots = slotsData?.meta.total || 0;
  const showingFrom = (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalSlots);

  // Mutation to create a single slot
  const createSlotMutation = useMutation({
    mutationFn: (slotData: CreateSlotFormData) =>
      parkingSlotApi.createSlot({
        ...slotData,
        status: "AVAILABLE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminParkingSlots"] });
      toast({
        title: "Slot Created",
        description: "The parking slot has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewSlot({
        slotNumber: "",
        size: "medium",
        vehicleType: "car",
        location: "NORTH",
      });
      setPage(1);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create parking slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to create multiple slots in bulk
  const createBulkSlotsMutation = useMutation({
    mutationFn: (bulkData: CreateBulkSlotsFormData) =>
      parkingSlotApi.createSlotsInBulk(
        bulkData.count,
        bulkData.baseNumber,
        bulkData.size,
        bulkData.vehicleType,
        bulkData.location
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminParkingSlots"] });
      toast({
        title: "Slots Created",
        description: "The parking slots have been created in bulk.",
      });
      setIsBulkCreateDialogOpen(false);
      setBulkSlots({
        count: 5,
        baseNumber: "A",
        size: "medium",
        vehicleType: "car",
        location: "NORTH",
      });
      setPage(1);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create parking slots. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a slot
  const deleteSlotMutation = useMutation({
    mutationFn: (id: number) => parkingSlotApi.deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminParkingSlots"] });
      toast({
        title: "Slot Deleted",
        description: "The parking slot has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedSlot(null);
      
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (slotsData?.data.length === 1 && page > 1) {
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

  // Handle search change
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

  // Open delete dialog
  const handleDeleteClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submit for single slot creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSlotMutation.mutate(newSlot);
  };

  // Handle form submit for bulk slot creation
  const handleBulkCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBulkSlotsMutation.mutate(bulkSlots);
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
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkCreateDialogOpen(true)}
            disabled={createBulkSlotsMutation.isPending}
          >
            {createBulkSlotsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Bulk Create"
            )}
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={createSlotMutation.isPending}
          >
            {createSlotMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Create Slot
              </>
            )}
          </Button>
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
          ) : slotsData?.data?.length ? (
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
                    {slotsData.data.map((slot: ParkingSlot) => (
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
                            onClick={() => handleDeleteClick(slot)}
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
              
              {/* Enhanced Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {totalSlots > 0 ? (
                    <>
                      Showing <span className="font-medium">{showingFrom}</span> to{' '}
                      <span className="font-medium">{showingTo}</span> of{' '}
                      <span className="font-medium">{totalSlots}</span> slots
                    </>
                  ) : (
                    "No slots found"
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={handlePageSizeChange}
                      disabled={totalSlots === 0}
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
                  
                  {totalSlots > 0 && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-gray-500">No parking slots found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create New Slot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Slot Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Parking Slot</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new parking slot.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                required
                placeholder="Slot Number (e.g., A1, B2)"
                value={newSlot.slotNumber}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, slotNumber: e.target.value.toUpperCase() })
                }
              />
              
              <Select
                value={newSlot.size}
                onValueChange={(value) =>
                  setNewSlot({ ...newSlot, size: value as "small" | "medium" | "large" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (Motorcycle)</SelectItem>
                  <SelectItem value="medium">Medium (Car)</SelectItem>
                  <SelectItem value="large">Large (Truck/Bus)</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newSlot.vehicleType}
                onValueChange={(value) =>
                  setNewSlot({ ...newSlot, vehicleType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newSlot.location}
                onValueChange={(value) =>
                  setNewSlot({
                    ...newSlot,
                    location: value as "NORTH" | "SOUTH" | "EAST" | "WEST",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORTH">North Zone</SelectItem>
                  <SelectItem value="SOUTH">South Zone</SelectItem>
                  <SelectItem value="EAST">East Zone</SelectItem>
                  <SelectItem value="WEST">West Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createSlotMutation.isPending}
                className="w-full"
              >
                {createSlotMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Slot"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Slots Dialog */}
      <Dialog
        open={isBulkCreateDialogOpen}
        onOpenChange={setIsBulkCreateDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Create Parking Slots</DialogTitle>
            <DialogDescription>
              Create multiple parking slots at once by specifying the count and base number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                type="number"
                required
                min={1}
                max={100}
                value={bulkSlots.count}
                onChange={(e) =>
                  setBulkSlots({ ...bulkSlots, count: Number(e.target.value) })
                }
                placeholder="Number of slots to create (1-100)"
              />
              
              <Input
                required
                maxLength={3}
                placeholder="Base Slot Number (e.g., A)"
                value={bulkSlots.baseNumber}
                onChange={(e) =>
                  setBulkSlots({
                    ...bulkSlots,
                    baseNumber: e.target.value.toUpperCase(),
                  })
                }
              />
              
              <Select
                value={bulkSlots.size}
                onValueChange={(value) =>
                  setBulkSlots({ ...bulkSlots, size: value as "small" | "medium" | "large" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (Motorcycle)</SelectItem>
                  <SelectItem value="medium">Medium (Car)</SelectItem>
                  <SelectItem value="large">Large (Truck/Bus)</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={bulkSlots.vehicleType}
                onValueChange={(value) =>
                  setBulkSlots({ ...bulkSlots, vehicleType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={bulkSlots.location}
                onValueChange={(value) =>
                  setBulkSlots({
                    ...bulkSlots,
                    location: value as "NORTH" | "SOUTH" | "EAST" | "WEST",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORTH">North Zone</SelectItem>
                  <SelectItem value="SOUTH">South Zone</SelectItem>
                  <SelectItem value="EAST">East Zone</SelectItem>
                  <SelectItem value="WEST">West Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createBulkSlotsMutation.isPending}
                className="w-full"
              >
                {createBulkSlotsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Slots...
                  </>
                ) : (
                  "Create Slots in Bulk"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete parking slot "
              {selectedSlot?.slotNumber}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteSlotMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedSlot && deleteSlotMutation.mutate(selectedSlot.id)
              }
              disabled={deleteSlotMutation.isPending}
            >
              {deleteSlotMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Slot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkingSlots;