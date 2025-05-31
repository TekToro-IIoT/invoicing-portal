import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import TimeTracking from "@/pages/time-tracking";
import TimeTickets from "@/pages/time-tickets";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-tektoro-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={DashboardLayout} />
          <Route path="/time-tickets" component={TimeTicketsLayout} />
          <Route path="/invoices" component={InvoicesLayout} />
          <Route path="/time-tracking" component={TimeTrackingLayout} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Dashboard" subtitle="Welcome back, manage your invoices and time tracking" />
        <Dashboard />
      </div>
    </div>
  );
}

function InvoicesLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Invoice Management" subtitle="Create, edit, and manage your invoices" />
        <Invoices />
      </div>
    </div>
  );
}

function TimeTicketsLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main>
          <TimeTickets />
        </main>
      </div>
    </div>
  );
}

function TimeTrackingLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Time Tracking" subtitle="Track time for projects and generate billable hours" />
        <TimeTracking />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
