import { createRoot } from "react-dom/client";
import { useState } from "react";
import "./index.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  if (showLogin) {
    return <Login onLogin={() => setIsLoggedIn(true)} onBack={() => setShowLogin(false)} />;
  }

  return <Landing onShowLogin={() => setShowLogin(true)} />;
}

function Landing({ onShowLogin }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            TekToro Invoice System
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Professional invoice and time-tracking solution
          </p>
          <div className="space-y-4">
            <button 
              onClick={onShowLogin}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold w-full"
            >
              Demo Login
            </button>
            <button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold w-full"
            >
              Admin Login (Replit Auth)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Demo Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">TekToro Invoice System</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-400">$12,500</p>
            </div>
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Active Invoices</h3>
              <p className="text-3xl font-bold text-blue-400">8</p>
            </div>
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Hours Tracked</h3>
              <p className="text-3xl font-bold text-purple-400">156</p>
            </div>
          </div>
          <div className="mt-8 bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg">
                Create Invoice
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
                Track Time
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg">
                View Reports
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg">
                Manage Clients
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
