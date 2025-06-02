import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function TimeTickets() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    todaysDate: new Date().toISOString().split('T')[0],
    serviceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    submittedBy: (user as any)?.email || '',
    client: '',
    project: '',
    area: '',
    milestoneAchieved: '',
    internalJobNumber: '',
    clientJobCode: '',
    regularTimeHours: 0,
    overtimeHours: 0,
    servicePoint: '',
    afeType: 'AFE',
    afeNumber: '',
    wellName: '',
    wellNumber: '',
    detailedServiceDescription: '',
    equipmentDescription: '',
  });

  const [totalHours, setTotalHours] = useState(0);

  // Calculate total hours
  useEffect(() => {
    const total = parseFloat(formData.regularTimeHours.toString()) + parseFloat(formData.overtimeHours.toString());
    setTotalHours(isNaN(total) ? 0 : total);
  }, [formData.regularTimeHours, formData.overtimeHours]);

  // Fetch time tickets
  const { data: timeTickets = [], isLoading } = useQuery({
    queryKey: ['/api/time-tickets'],
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
  });

  // Create time ticket mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/time-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create time ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-tickets'] });
      toast({
        title: "Success",
        description: "Time ticket saved as draft",
      });
      // Reset form
      setFormData({
        todaysDate: new Date().toISOString().split('T')[0],
        serviceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submittedBy: (user as any)?.email || '',
        client: '',
        project: '',
        area: '',
        milestoneAchieved: '',
        internalJobNumber: '',
        clientJobCode: '',
        regularTimeHours: 0,
        overtimeHours: 0,
        servicePoint: '',
        afeType: 'AFE',
        afeNumber: '',
        wellName: '',
        wellNumber: '',
        detailedServiceDescription: '',
        equipmentDescription: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save time ticket",
        variant: "destructive",
      });
    },
  });

  // Submit time ticket mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/time-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'submitted' }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit time ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-tickets'] });
      toast({
        title: "Success",
        description: "Time ticket submitted successfully",
      });
      // Reset form
      setFormData({
        todaysDate: new Date().toISOString().split('T')[0],
        serviceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submittedBy: (user as any)?.email || '',
        client: '',
        project: '',
        area: '',
        milestoneAchieved: '',
        internalJobNumber: '',
        clientJobCode: '',
        regularTimeHours: 0,
        overtimeHours: 0,
        servicePoint: '',
        afeType: 'AFE',
        afeNumber: '',
        wellName: '',
        wellNumber: '',
        detailedServiceDescription: '',
        equipmentDescription: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit time ticket",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = () => {
    const dataToSubmit = {
      ...formData,
      totalHours,
      status: 'draft'
    };
    createMutation.mutate(dataToSubmit);
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      ...formData,
      totalHours,
      status: 'submitted'
    };
    submitMutation.mutate(dataToSubmit);
  };

  return (
    <div className="p-6 bg-tektoro-bg min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-tektoro-primary rounded-full flex items-center justify-center mr-3">
            <i className="fas fa-clock text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Time Tickets</h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <Card className="bg-tektoro-dark border-gray-600">
          <CardContent className="p-6">
            {/* Date and Submission Info */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div>
                <Label className="text-white">Time Entry Date</Label>
                <Input
                  type="date"
                  value={formData.todaysDate}
                  onChange={(e) => handleInputChange('todaysDate', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Service Date</Label>
                <Input
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Submitted By</Label>
                <div className="text-sm text-gray-400 mb-2">Admin Control</div>
                <Input
                  value={formData.submittedBy}
                  onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                  placeholder="Select team member"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Admins can submit time tickets on behalf of any team member
                </div>
              </div>
              
              <div>
                <Label className="text-white">Total Hours</Label>
                <div className="text-2xl text-tektoro-primary font-bold mt-2">
                  {totalHours.toFixed(1)} hrs
                </div>
              </div>
            </div>

            {/* Client, Project, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Select
                  value={formData.client}
                  onValueChange={(value) => handleInputChange('client', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {(companies as any[]).map((company: any) => (
                      <SelectItem 
                        key={company.id} 
                        value={company.name}
                        className="text-white hover:bg-gray-600"
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  placeholder="Select project"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Input
                  placeholder="Select an area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Milestone and Job Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Input
                  placeholder="Select milestone achieved"
                  value={formData.milestoneAchieved}
                  onChange={(e) => handleInputChange('milestoneAchieved', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Internal Job Number</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex items-center text-gray-400">#</div>
                  <Input
                    placeholder="Select or enter job number"
                    value={formData.internalJobNumber}
                    onChange={(e) => handleInputChange('internalJobNumber', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">Or enter manual job number</div>
              </div>
              
              <div>
                <Label className="text-white">Client Job Code/Job #</Label>
                <Input
                  placeholder="Client job reference"
                  value={formData.clientJobCode}
                  onChange={(e) => handleInputChange('clientJobCode', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
            </div>

            {/* Time Entry Section */}
            <div className="mb-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                Enter Both Regular Time and Overtime Hours:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label className="text-white">Regular Time (RT) Hours</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.regularTimeHours}
                    onChange={(e) => handleInputChange('regularTimeHours', parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-xl mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Overtime (OT) Hours</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.overtimeHours}
                    onChange={(e) => handleInputChange('overtimeHours', parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-xl mt-2"
                  />
                </div>
              </div>

              {/* Total Time Display */}
              <div className="border-2 border-tektoro-primary rounded-lg p-4 bg-gray-800">
                <div className="text-white text-lg">
                  <span>Total Time:</span>
                  <span className="float-right text-tektoro-primary font-bold">
                    RT: {formData.regularTimeHours.toFixed(1)} + OT: {formData.overtimeHours.toFixed(1)} = Total: {totalHours.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contractor Invoice Details */}
            <div className="mb-6">
              <h3 className="text-blue-400 text-lg font-semibold mb-4">
                Contractor Invoice Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <Label className="text-white">Service Point *</Label>
                  <Input
                    placeholder="e.g., JGK E-72, General SCADA"
                    value={formData.servicePoint}
                    onChange={(e) => handleInputChange('servicePoint', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-white">AFE/LOE Type *</Label>
                  <Input
                    value={formData.afeType}
                    onChange={(e) => handleInputChange('afeType', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-white">AFE Number</Label>
                  <Input
                    placeholder="e.g., 20250112"
                    value={formData.afeNumber}
                    onChange={(e) => handleInputChange('afeNumber', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label className="text-white">Well Name</Label>
                  <Input
                    placeholder="Well name (if applicable)"
                    value={formData.wellName}
                    onChange={(e) => handleInputChange('wellName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Well Number</Label>
                  <Input
                    placeholder="Well number (if applicable)"
                    value={formData.wellNumber}
                    onChange={(e) => handleInputChange('wellNumber', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="text-white">Detailed Service Description *</Label>
                <textarea
                  placeholder="e.g., Troubleshoot poor comms with onsite meter tech, Debug PV report script"
                  value={formData.detailedServiceDescription}
                  onChange={(e) => handleInputChange('detailedServiceDescription', e.target.value)}
                  className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <Label className="text-white">Equipment Description (if purchasing equipment)</Label>
                <textarea
                  placeholder="e.g., 12″ x 20″ x 8″ Emerson Battery Enclosure, ABB TotalFlow 2″ Gas Meter"
                  value={formData.equipmentDescription}
                  onChange={(e) => handleInputChange('equipmentDescription', e.target.value)}
                  className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleSaveDraft}
                disabled={createMutation.isPending}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Save Draft
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !formData.client || !formData.project}
                className="bg-tektoro-primary hover:bg-green-600 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                Submit Time Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time Tickets List */}
        {(timeTickets as any[]).length > 0 && (
          <Card className="mt-6 bg-tektoro-dark border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Recent Time Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(timeTickets as any[]).map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {ticket.client} - {ticket.project}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(ticket.serviceDate).toLocaleDateString()} • {ticket.totalHours}h
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'submitted' 
                          ? 'bg-tektoro-primary text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}