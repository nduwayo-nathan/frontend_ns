import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { slotRequestApi, parkingSlotApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Check, X } from "lucide-react";
import { ParkingSlot, SlotRequest } from "@/types";

const SlotRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(undefined);
  const [updatedPlate, setUpdatedPlate] = useState("");

  const { data: slotRequestsData, isLoading } = useQuery({
    queryKey: ["slotRequests"],
    queryFn: () => slotRequestApi.getRequests(),
  });

  const { data: availableSlots } = useQuery({
    queryKey: ["availableSlots"],
    queryFn: () => parkingSlotApi.getSlots(),
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({
      id,
      slotId,
      plateNumber,
    }: {
      id: number;
      slotId: number;
      plateNumber: string;
    }) => slotRequestApi.approveRequest(id, slotId, plateNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slotRequests"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast({
        title: "Request Approved",
        description: "Slot assigned and request approved.",
      });
      setApproveDialogOpen(false);
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (id: number) => slotRequestApi.updateRequestStatus(id, "REJECTED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slotRequests"] });
      toast({
        title: "Request Rejected",
        description: "The slot request has been rejected.",
      });
    },
  });

  const filteredRequests = slotRequestsData?.data?.filter((request: SlotRequest) => {
    const matchesStatus = statusFilter === "all" || request.requestStatus === statusFilter;
    const plate = request.vehicle.plateNumber.toLowerCase();
    return matchesStatus && plate.includes(search.toLowerCase());
  }) || [];

  const handleApproveClick = (request: SlotRequest) => {
    setSelectedRequest(request);
    setUpdatedPlate(request.vehicle.plateNumber);
    setSelectedSlotId(undefined);
    setApproveDialogOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedRequest || !selectedSlotId) return;
    approveRequestMutation.mutate({
      id: selectedRequest.id,
      slotId: selectedSlotId,
      plateNumber: updatedPlate,
    });
  };

  const getStatusBadge = (status: string) => {
    const common = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "APPROVED":
        return <span className={`${common} bg-green-100 text-green-800`}>Approved</span>;
      case "REJECTED":
        return <span className={`${common} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${common} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Slot Requests</h1>
        <p className="text-muted-foreground">View and manage requests for parking slots</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle>Slot Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by plate number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 max-w-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Requested Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.userId}</TableCell>
                    <TableCell>{request.vehicle.plateNumber}</TableCell>
                    <TableCell>{request.vehicle.size}</TableCell>
                    <TableCell>{getStatusBadge(request.requestStatus)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {request.requestStatus === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleApproveClick(request)}>
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-100"
                            onClick={() => rejectRequestMutation.mutate(request.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a Slot and Approve</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Vehicle Plate</Label>
              <Input value={updatedPlate} onChange={(e) => setUpdatedPlate(e.target.value)} />
            </div>
            <div>
              <Label>Select Slot</Label>
              <Select
                value={selectedSlotId?.toString() || ""}
                onValueChange={(val) => setSelectedSlotId(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a parking slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots?.data?.map((slot: ParkingSlot) => (
                    <SelectItem key={slot.id} value={slot.id.toString()}>
                      {slot.slotNumber} - {slot.size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleApproveSubmit} disabled={!selectedSlotId}>
              Approve and Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlotRequests;
