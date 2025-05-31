// Basic JavaScript without React to test loading
console.log("JavaScript is loading...");

const root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div style="max-width: 32rem; margin: 0 auto; text-align: center;">
        <div style="background: #1e293b; border: 1px solid #475569; border-radius: 0.5rem; padding: 2rem;">
          <h1 style="font-size: 1.875rem; font-weight: bold; color: white; margin-bottom: 1rem;">
            TekToro Invoice System
          </h1>
          <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2rem;">
            Professional invoice and time-tracking solution
          </p>
          <button 
            onclick="window.location.href = '/api/login'"
            style="background: #16a34a; color: white; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer;"
            onmouseover="this.style.background='#15803d'"
            onmouseout="this.style.background='#16a34a'"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    </div>
  `;
  console.log("Page content loaded successfully");
} else {
  console.error("Root element not found");
}
