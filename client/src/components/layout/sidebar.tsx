import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import tektoroLogo from "@assets/tektoro-logo.png";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/time-tickets", label: "Time Tickets", icon: "fas fa-ticket-alt" },
    { path: "/invoices", label: "Invoices", icon: "fas fa-file-invoice" },
    { path: "/time-tracking", label: "Time Tracking", icon: "fas fa-clock" },
  ];

  const adminNavItems = [
    { path: "/user-profiles", label: "User Profiles", icon: "fas fa-users" },
    { path: "/companies", label: "Companies", icon: "fas fa-building" },
  ];

  return (
    <div className="w-64 bg-tektoro-dark text-white fixed h-full z-10">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src={tektoroLogo} 
              alt="TekToro Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-tektoro-primary">TekToro</h1>
            <p className="text-xs text-gray-400">Invoice & Time Tracking</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-tektoro-primary text-white' 
                    : 'hover:bg-tektoro-primary/20 text-gray-300 hover:text-white'
                }`}>
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Admin-only navigation */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 border-t border-gray-600">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">Admin</p>
                {adminNavItems.map((item) => {
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-tektoro-primary text-white' 
                          : 'hover:bg-tektoro-primary/20 text-gray-300 hover:text-white'
                      }`}>
                        <i className={`${item.icon} w-5`}></i>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="absolute bottom-0 w-full p-6 border-t border-gray-600">
        <div className="flex items-center space-x-3">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-tektoro-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white"></i>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'User'}</p>
          </div>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => window.location.href = '/api/logout'}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
