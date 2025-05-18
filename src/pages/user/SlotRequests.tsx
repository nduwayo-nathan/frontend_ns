import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { slotRequestApi, vehicleApi, parkingSlotApi } from "@/services/api";
import { Vehicle, SlotRequest, ParkingSlot } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";

const SlotRequests = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  const [newRequest, setNewRequest] = useState({ vehicleId: 0, slotId: 0 });

  const { data: requestsData } = useQuery({
    queryKey: ["userSlotRequests"],
    queryFn: () => slotRequestApi.getRequests(),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["userVehicles"],
    queryFn: () => vehicleApi.getVehicles(1, 100),
  });

  const { data: slotsData } = useQuery({
    queryKey: ["availableSlots"],
    queryFn: () => parkingSlotApi.getSlots(1, 100, { status: "AVAILABLE" }),
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: { vehicleId: number, slotId: number }) => 
      slotRequestApi.createRequest(data.vehicleId, data.slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSlotRequests"] });
      toast({ title: "Request Created", description: "Request submitted successfully." });
      setIsRequestDialogOpen(false);
      setNewRequest({ vehicleId: 0, slotId: 0 });
    },
    onError: () => toast({ title: "Error", description: "Failed to create request.", variant: "destructive" }),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: number) => slotRequestApi.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSlotRequests"] });
      toast({ title: "Request Deleted", description: "Request deleted successfully." });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to delete request.", variant: "destructive" }),
  });

  const getStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "APPROVED": return <span className={`${baseClass} bg-green-100 text-green-800`}>Approved</span>;
      case "REJECTED": return <span className={`${baseClass} bg-red-100 text-red-800`}>Rejected</span>;
      default: return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Parking Slot Requests</h1>
          <p className="text-muted-foreground">Manage your parking slot requests</p>
        </div>
        <Button onClick={() => setIsRequestDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>My Requests</CardTitle></CardHeader>
        <CardContent>
          {requestsData?.data?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Slot Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsData.data.map((request: SlotRequest) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">#{request.id}</TableCell>
                    <TableCell>{request.vehicle?.plateNumber || `Vehicle #${request.vehicleId}`}</TableCell>
                    <TableCell>{request.slotNumber}</TableCell>
                    <TableCell>{getStatusBadge(request.requestStatus)}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.requestStatus === "PENDING" && (
                        <Button variant="destructive" size="sm" onClick={() => {
                          setSelectedRequest(request);
                          setIsDeleteDialogOpen(true);
                        }}><Trash className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No slot requests yet</p>
              <Button onClick={() => setIsRequestDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Create Request</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Parking Slot</DialogTitle>
            <DialogDescription>Select a vehicle and available parking slot</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createRequestMutation.mutate(newRequest);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Select Vehicle</label>
                <Select value={String(newRequest.vehicleId)} onValueChange={(v) => setNewRequest({...newRequest, vehicleId: Number(v)})}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {vehiclesData?.data?.map((vehicle: Vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plateNumber} ({vehicle.vehicleType}, {vehicle.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Select Slot</label>
                <Select value={String(newRequest.slotId)} onValueChange={(v) => setNewRequest({...newRequest, slotId: Number(v)})}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select slot" /></SelectTrigger>
                  <SelectContent>
                    {slotsData?.data?.map((slot: ParkingSlot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {slot.slotNumber} - {slot.location} ({slot.size}, {slot.vehicleType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newRequest.vehicleId || !newRequest.slotId}>Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>Cancel this parking slot request?</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-1">
              <p><span className="font-medium">Slot:</span> {selectedRequest.slotNumber}</p>
              <p><span className="font-medium">Status:</span> {selectedRequest.requestStatus}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedRequest && deleteRequestMutation.mutate(selectedRequest.id)}>
              Delete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlotRequests;