import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TimeEntriesProps {
  timeEntries: any[];
}

export default function TimeEntries({ timeEntries }: TimeEntriesProps) {
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatTimeRange = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const startFormatted = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (!endTime) {
      return `${startFormatted} - Running`;
    }
    
    const end = new Date(endTime);
    const endFormatted = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusColor = (isRunning: boolean) => {
    return isRunning ? 'text-green-600' : 'text-blue-600';
  };

  const getStatusIcon = (isRunning: boolean) => {
    return isRunning ? 'fas fa-circle' : 'fas fa-clock';
  };

  if (timeEntries.length === 0) {
    return (
      <Card className="invoice-shadow scada-border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
        </div>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
            <p className="text-gray-500 mb-4">Start tracking time to see your entries here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="invoice-shadow scada-border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
          <Button 
            variant="outline" 
            size="sm"
            className="text-tektoro-orange border-tektoro-orange hover:bg-orange-50"
          >
            <i className="fas fa-plus mr-2"></i>Add Manual Entry
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  entry.isRunning ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <i className={`${getStatusIcon(entry.isRunning)} ${getStatusColor(entry.isRunning)}`}></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.project?.name || 'Unknown Project'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.description || 'No description provided'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(entry.startTime)}, {formatTimeRange(entry.startTime, entry.endTime)}
                  </p>
                  {entry.project?.client && (
                    <p className="text-xs text-gray-400">
                      Client: {entry.project.client.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatDuration(entry.duration)}
                </p>
                <p className="text-sm text-gray-500">
                  ${parseFloat(entry.hourlyRate || '0').toFixed(0)}/hr
                </p>
                {entry.duration && entry.hourlyRate && (
                  <p className="text-xs text-green-600 font-medium">
                    ${((entry.duration / 60) * parseFloat(entry.hourlyRate)).toFixed(2)}
                  </p>
                )}
                {entry.isRunning && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    <i className="fas fa-circle text-green-500 mr-1 text-xs"></i>
                    Running
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {timeEntries.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              className="text-tektoro-blue border-tektoro-blue hover:bg-blue-50"
            >
              View All Time Entries
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
