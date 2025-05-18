import React from "react";
import { Link } from "react-router-dom";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-190px)] flex items-center justify-center bg-slate-100 px-4">
      <div className="text-center max-w-2xl space-y-6">
        <div className="flex justify-center">
          <CarFront className="w-20 h-20 text-gray-800" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Vehicle Slot Manager</h1>
        <p className="text-gray-600 text-lg">
          Effortlessly register vehicles and manage parking slots with modern tools.
        </p>
        <div className="flex justify-center gap-6">
          <Link to="/register">
            <Button size="lg" className="bg-gray-600 text-white hover:gray-500">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
