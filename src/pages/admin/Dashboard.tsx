import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { vehicleApi, slotRequestApi, parkingSlotApi } from "@/services/api";
import { Vehicle, SlotRequest, ParkingSlot } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Car } from "lucide-react";
import ParkingSlots from "./ParkingSlots";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const {
    data: vehiclesData,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
  } = useQuery({
    queryKey: ["adminVehicles"],
    queryFn: () => vehicleApi.getVehicles(),
  });

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ["adminSlotRequests"],
    queryFn: () => slotRequestApi.getRequests(),
  });

  const {
    data: slotsData,
    isLoading: isSlotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["adminParkingSlots"],
    queryFn: () => parkingSlotApi.getSlots(),
  });
  console.log("here we go", requestsData);

  // Count stats
  const pendingVehicles =
    vehiclesData?.data?.filter(
      (v: Vehicle) => v.additionalAttributes?.status === "PENDING"
    ).length || 0;
  const pendingRequests =
    requestsData?.data?.filter(
      (r: SlotRequest) => r.requestStatus === "PENDING"
    ).length || 0;
  const availableSlots =
    slotsData?.data?.filter((s: ParkingSlot) => s.status === "AVAILABLE")
      .length || 0;

  const occupiedSlots =
    slotsData?.data?.filter((s: ParkingSlot) => s.status === "OCCUPIED")
      .length || 0;
  console.log("pending vehhhh", pendingRequests ?? 0);
  

  if (isVehiclesLoading || isRequestsLoading || isSlotsLoading) {
    return <div className="p-6">Loading...</div>;
  }
  if (vehiclesError || requestsError || slotsError) {
    return (
      <div className="p-6 text-red-500">
        Error loading data. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Registered cars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehiclesData?.data?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered cars a
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/admin/vehicles">View Vehicles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Slot requests awaiting assignment
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/admin/requests">View Requests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSlots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Slots available for assignment
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/admin/slots">Manage Slots</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Occupied Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedSlots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently occupied parking slots
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/admin/slots">View Details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Vehicle Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {vehiclesData?.data?.length > 0 ? (
              <div className="space-y-4">
                {vehiclesData.data
                  .filter(
                    (vehicle: Vehicle) =>
                      vehicle.additionalAttributes?.status === "PENDING"
                  )
                  .slice(0, 4)
                  .map((vehicle: Vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Car className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{vehicle.plateNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.vehicleType}, {vehicle.size}
                          </p>
                        </div>
                      </div>
                      <Link to="/admin/vehicles">
                        <Button size="sm">Review</Button>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No pending vehicle requests
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Slot Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsData?.data?.length > 0 ? (
              <div className="space-y-4">
                {requestsData.data
                  .filter((r: SlotRequest) => r.requestStatus === "PENDING")
                  .slice(0, 4)
                  .map((request: SlotRequest) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Slot {request.slotNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to="/admin/requests">
                        <Button size="sm">Review</Button>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No pending slot requests
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
