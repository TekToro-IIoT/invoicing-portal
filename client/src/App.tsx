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
import UserProfiles from "@/pages/user-profiles";
import Companies from "@/pages/companies";
import CompanyProfile from "@/pages/company-profile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show landing page while loading or when not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DashboardLayout} />
      <Route path="/time-tickets" component={TimeTicketsLayout} />
      <Route path="/invoices" component={InvoicesLayout} />
      <Route path="/time-tracking" component={TimeTrackingLayout} />
      <Route path="/user-profiles" component={UserProfilesLayout} />
      <Route path="/companies" component={CompaniesLayout} />
      <Route path="/company-profile" component={CompanyProfileLayout} />
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

function UserProfilesLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="User Profiles" subtitle="Manage user billing rates and permissions" />
        <main className="p-6">
          <UserProfiles />
        </main>
      </div>
    </div>
  );
}

function CompaniesLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Company Management" subtitle="Manage company information for billing and invoices" />
        <main className="p-6">
          <Companies />
        </main>
      </div>
    </div>
  );
}

function CompanyProfileLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Company Profile" subtitle="Manage your company logo and information for invoices" />
        <main className="p-6">
          <CompanyProfile />
        </main>
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
