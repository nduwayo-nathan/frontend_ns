
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleApi } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VehicleFormValues {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
}

const AddVehicle: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>();

  const createVehicleMutation = useMutation({
    mutationFn: (vehicleData: VehicleFormValues) => vehicleApi.createVehicle({
      ...vehicleData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userVehicles"] });
      toast({
        title: "Vehicle registered",
        description: "Your vehicle has been submitted for approval.",
      });
      navigate("/vehicles");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    createVehicleMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Register a New Vehicle</CardTitle>
          <CardDescription>
            Enter your vehicle details to register it in our system.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  {...register("make", {
                    required: "Vehicle make is required",
                  })}
                  placeholder="Toyota, Honda, Ford, etc."
                />
                {errors.make && (
                  <p className="text-red-500 text-sm">{errors.make.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  {...register("model", {
                    required: "Vehicle model is required",
                  })}
                  placeholder="Corolla, Civic, F-150, etc."
                />
                {errors.model && (
                  <p className="text-red-500 text-sm">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  {...register("year", {
                    required: "Year is required",
                    min: {
                      value: 1900,
                      message: "Year must be at least 1900",
                    },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: `Year must not exceed ${
                        new Date().getFullYear() + 1
                      }`,
                    },
                  })}
                  placeholder="2022"
                />
                {errors.year && (
                  <p className="text-red-500 text-sm">{errors.year.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  {...register("color", {
                    required: "Vehicle color is required",
                  })}
                  placeholder="Red, Blue, White, etc."
                />
                {errors.color && (
                  <p className="text-red-500 text-sm">{errors.color.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  {...register("licensePlate", {
                    required: "License plate is required",
                    pattern: {
                      value: /^[A-Z0-9\s-]+$/i,
                      message:
                        "License plate should only contain letters, numbers, spaces and hyphens",
                    },
                  })}
                  placeholder="ABC-1234"
                />
                {errors.licensePlate && (
                  <p className="text-red-500 text-sm">
                    {errors.licensePlate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/vehicles")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Vehicle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddVehicle;
