import { createRoot } from "react-dom/client";
import "./index.css";

// Simplified App to test basic functionality
function SimpleApp() {
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
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);
