// src/components/Layout.tsx
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Car } from "lucide-react";

const Layout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header always visible */}
      <header className="bg-gray-800 text-white p-4 shadow-md h-[64px]">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Car className="h-6 w-6" />
            Vehicle Slot Manager
          </Link>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/user/dashboard" className="hover:underline">Dashboard</Link>
            {!isLoginPage && <Link to="/login" className="hover:underline">Login</Link>}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer always visible */}
      <footer className="bg-gray-700 text-white py-6 h-[96px]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Car className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">VehicleReg</span>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VehicleReg App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
