
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { vehicleApi, slotRequestApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Vehicle, SlotRequest } from "@/types";
import { Car, User, LogOut } from "lucide-react";

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();


  const { data: vehiclesData } = useQuery({
    queryKey: ["userVehicles"],
    queryFn: () => vehicleApi.getVehicles(1, 100),
  });

  console.log("vehicle data:",vehiclesData);
  

  const { data: requestsData } = useQuery({
    queryKey: ["userSlotRequests"],
    queryFn: () => slotRequestApi.getRequests(),
  });

  
  const totalVehicles = vehiclesData?.data?.length || 0;
  const pendingRequests = requestsData?.data?.filter((r: SlotRequest) => r.requestStatus === "PENDING").length || 0;
  const approvedRequests = requestsData?.data?.filter((r: SlotRequest) => r.requestStatus === "APPROVED").length || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Car className="h-4 w-4 mr-2" /> My Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered vehicles in your account
            </p>
            <Button className="mt-4 w-full" asChild>
              <Link to="/user/vehicles">View Vehicles</Link>
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
              Awaiting approval from admin
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/user/slots/request">View Requests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently assigned parking slots
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/user/slots">View Assigned Slots</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {vehiclesData?.data?.length ? (
              <div className="space-y-4">
                {vehiclesData.data.slice(0, 3).map((vehicle: Vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between border p-3 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">{vehicle.plateNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.vehicleType}, {vehicle.size}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {vehiclesData.data.length > 3 && (
                  <Button variant="link" className="w-full" asChild>
                    <Link to="/user/vehicles">View all vehicles</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No vehicles found</p>
                <Button asChild>
                  <Link to="/user/vehicles/add">Add Vehicle</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsData?.data?.length ? (
              <div className="space-y-4">
                {requestsData.data.slice(0, 3).map((request: SlotRequest) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Slot {request.slotNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        <span
                          className={
                            request.requestStatus === "APPROVED"
                              ? "text-green-600"
                              : request.requestStatus === "REJECTED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }
                        >
                          {request.requestStatus}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
                {requestsData.data.length > 3 && (
                  <Button variant="link" className="w-full" asChild>
                    <Link to="/user/slots/request">View all requests</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No slot requests found</p>
                <Button asChild variant="outline">
                  <Link to="/user/slots/request">Request a Slot</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
