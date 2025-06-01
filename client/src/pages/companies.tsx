
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Plus, Edit, Trash2, User } from "lucide-react";
import type { Client, Company } from "@shared/schema";

export default function Companies() {
  const { toast } = useToast();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      await apiRequest('POST', '/api/clients', clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: any) => {
      await apiRequest('PUT', `/api/clients/${id}`, clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const clientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string,
      contactPerson: formData.get('contactPerson') as string,
      companyId: formData.get('companyId') ? parseInt(formData.get('companyId') as string) : null,
    };

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...clientData });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Client Management</h1>
            <p className="text-gray-400">Manage client information for billing and invoices</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingClient(null)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-400">Client Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingClient?.name || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson" className="text-gray-400">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    defaultValue={editingClient?.contactPerson || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-400">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingClient?.email || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-400">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingClient?.phone || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyId" className="text-gray-400">Associated Company</Label>
                <Select 
                  name="companyId" 
                  defaultValue={editingClient?.companyId?.toString() || ""}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a company (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="" className="text-white hover:bg-gray-600">
                      No company
                    </SelectItem>
                    {companies.map((company: Company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="text-white hover:bg-gray-600">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-400">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={editingClient?.address || ''}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-400">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingClient?.city || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-400">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editingClient?.state || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-gray-400">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={editingClient?.zipCode || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-gray-400">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingClient?.country || 'United States'}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClientMutation.isPending || updateClientMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createClientMutation.isPending || updateClientMutation.isPending ? 'Saving...' : 'Save Client'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client: Client) => (
          <Card key={client.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  {client.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.contactPerson && (
                <div className="text-sm text-gray-300">
                  Contact: {client.contactPerson}
                </div>
              )}
              
              {client.address && (
                <div className="text-sm text-gray-300">
                  {client.address}
                  {client.city && <><br />{client.city}{client.state && `, ${client.state}`} {client.zipCode}</>}
                </div>
              )}
              
              {client.email && (
                <div className="text-sm text-gray-300">
                  Email: {client.email}
                </div>
              )}
              
              {client.phone && (
                <div className="text-sm text-gray-300">
                  Phone: {client.phone}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={() => handleEdit(client)}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  onClick={() => handleDelete(client.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  disabled={deleteClientMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No clients found</h3>
            <p className="text-gray-400 text-center mb-4">
              Add clients to create invoices and manage billing information.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
