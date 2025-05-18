
import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Car, User, LogOut } from "lucide-react";

const UserLayout = () => {
  const { logout, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 bg-white z-10 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Vehicle Slot Manager</h1>
        <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
          <Button variant="outline" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </Button>
        </CollapsibleTrigger>
      </div>

      {/* Sidebar for both mobile and desktop */}
      <Collapsible
        className="lg:w-64 bg-white shadow-sm lg:relative fixed inset-y-0 left-0 z-20 transform lg:translate-x-0 transition-all duration-300"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleContent
          className="flex flex-col h-screen lg:h-auto"
          forceMount
        >
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold">VSM</h1>
            <p className="text-gray-500">Vehicle Slot Manager</p>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>
            
            <Link
              to="/vehicles"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <Car className="h-5 w-5 mr-3" />
              My Vehicles
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </Link>
          </nav>

          <div className="px-4 py-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                <p className="text-xs font-medium text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Main content */}
      <div className="flex-1">
        <div className="lg:p-8 p-4 pt-20 lg:pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
