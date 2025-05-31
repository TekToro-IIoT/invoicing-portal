import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Timer from "@/components/time/timer";
import TimeEntries from "@/components/time/time-entries";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function TimeTracking() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery({
    queryKey: ["/api/time-entries"],
    retry: false,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: runningEntry } = useQuery({
    queryKey: ["/api/time-entries/running"],
    retry: false,
    refetchInterval: 1000, // Refresh every second to update timer
  });

  if (timeEntriesLoading || projectsLoading) {
    return (
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 invoice-shadow scada-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 invoice-shadow scada-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Timer */}
        <div className="lg:col-span-1">
          <Timer 
            projects={projects || []} 
            runningEntry={runningEntry}
          />
        </div>
        
        {/* Time Entries */}
        <div className="lg:col-span-2">
          <TimeEntries 
            timeEntries={timeEntries || []}
          />
        </div>
      </div>
    </main>
  );
}
