import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TimerProps {
  projects: any[];
  runningEntry?: any;
}

export default function Timer({ projects, runningEntry }: TimerProps) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [seconds, setSeconds] = useState(0);

  // Update timer display if there's a running entry
  useEffect(() => {
    if (runningEntry) {
      const startTime = new Date(runningEntry.startTime);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setSeconds(elapsed);
      setSelectedProject(runningEntry.projectId.toString());
      setDescription(runningEntry.description || "");
    } else {
      setSeconds(0);
    }
  }, [runningEntry]);

  // Update timer every second if running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (runningEntry) {
      interval = setInterval(() => {
        const startTime = new Date(runningEntry.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setSeconds(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningEntry]);

  const startTimerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProject) {
        throw new Error("Please select a project");
      }

      const project = projects.find(p => p.id === parseInt(selectedProject));
      if (!project) {
        throw new Error("Invalid project selected");
      }

      return await apiRequest("POST", "/api/time-entries", {
        projectId: parseInt(selectedProject),
        description: description.trim(),
        startTime: new Date().toISOString(),
        hourlyRate: project.hourlyRate,
        isRunning: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/running"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Timer Started",
        description: "Time tracking has started for this project",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to start timer",
        variant: "destructive",
      });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      if (!runningEntry) {
        throw new Error("No timer is currently running");
      }
      return await apiRequest("POST", `/api/time-entries/${runningEntry.id}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/running"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedProject("");
      setDescription("");
      setSeconds(0);
      toast({
        title: "Timer Stopped",
        description: "Time entry has been saved",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    },
  });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startTimerMutation.mutate();
  };

  const handleStop = () => {
    stopTimerMutation.mutate();
  };

  return (
    <Card className="invoice-shadow scada-border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Timer</h3>
      </div>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${runningEntry ? 'text-tektoro-blue' : 'text-gray-400'}`}>
            {formatTime(seconds)}
          </div>
          <p className="text-gray-500">
            {runningEntry ? 'Current Session' : 'Ready to Start'}
          </p>
        </div>
        
        <form className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
              disabled={!!runningEntry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="no-projects" disabled>
                    No projects available
                  </SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} - {project.client?.name || 'Unknown Client'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              rows={3}
              disabled={!!runningEntry}
            />
          </div>
        </form>
        
        <div className="flex space-x-3">
          {!runningEntry ? (
            <Button 
              onClick={handleStart}
              disabled={!selectedProject || startTimerMutation.isPending}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <i className="fas fa-play mr-2"></i>
              {startTimerMutation.isPending ? 'Starting...' : 'Start'}
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              disabled={stopTimerMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <i className="fas fa-stop mr-2"></i>
              {stopTimerMutation.isPending ? 'Stopping...' : 'Stop'}
            </Button>
          )}
        </div>
        
        {projects.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
              <p className="text-sm text-yellow-800">
                No projects available. Create a project and client first to start tracking time.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
