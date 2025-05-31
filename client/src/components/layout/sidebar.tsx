import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/invoices", label: "Invoices", icon: "fas fa-file-invoice" },
    { path: "/time-tracking", label: "Time Tracking", icon: "fas fa-clock" },
  ];

  return (
    <div className="w-64 bg-tektoro-blue text-white fixed h-full z-10">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-tektoro-orange rounded-lg flex items-center justify-center">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold">TekToro</h1>
            <p className="text-xs text-blue-200">Invoice & Time Tracking</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 text-blue-100 hover:text-white'
                }`}>
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="absolute bottom-0 w-full p-6 border-t border-blue-600">
        <div className="flex items-center space-x-3">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-blue-200"></i>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-blue-200 capitalize">{user?.role || 'User'}</p>
          </div>
          <button 
            className="text-blue-200 hover:text-white"
            onClick={() => window.location.href = '/api/logout'}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
