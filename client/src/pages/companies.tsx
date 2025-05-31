import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Plus, Edit, Trash2, Star, StarOff } from "lucide-react";
import type { Company } from "@shared/schema";

export default function Companies() {
  const { toast } = useToast();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      await apiRequest('/api/companies', 'POST', companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsDialogOpen(false);
      setEditingCompany(null);
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, ...companyData }: any) => {
      await apiRequest(`/api/companies/${id}`, 'PUT', companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsDialogOpen(false);
      setEditingCompany(null);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/companies/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/companies/${id}/default`, 'PUT');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Success",
        description: "Default company updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update default company",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const companyData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      taxId: formData.get('taxId') as string,
      isDefault: formData.get('isDefault') === 'on',
    };

    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, ...companyData });
    } else {
      createCompanyMutation.mutate(companyData);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this company?')) {
      deleteCompanyMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Company Management</h1>
            <p className="text-gray-400">Manage company information for billing and invoices</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingCompany(null)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-400">Company Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCompany?.name || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-400">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingCompany?.email || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-400">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={editingCompany?.address || ''}
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
                    defaultValue={editingCompany?.city || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-400">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editingCompany?.state || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-gray-400">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={editingCompany?.zipCode || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-gray-400">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={editingCompany?.country || 'USA'}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-400">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingCompany?.phone || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website" className="text-gray-400">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={editingCompany?.website || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="taxId" className="text-gray-400">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    defaultValue={editingCompany?.taxId || ''}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  defaultChecked={editingCompany?.isDefault || false}
                  className="rounded border-gray-600 bg-gray-700"
                />
                <Label htmlFor="isDefault" className="text-gray-400">Set as default company</Label>
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
                  disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createCompanyMutation.isPending || updateCompanyMutation.isPending ? 'Saving...' : 'Save Company'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company: Company) => (
          <Card key={company.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-400" />
                  {company.name}
                </CardTitle>
                {company.isDefault && (
                  <Badge className="bg-green-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.address && (
                <div className="text-sm text-gray-300">
                  {company.address}
                  {company.city && <><br />{company.city}{company.state && `, ${company.state}`} {company.zipCode}</>}
                </div>
              )}
              
              {company.email && (
                <div className="text-sm text-gray-300">
                  Email: {company.email}
                </div>
              )}
              
              {company.phone && (
                <div className="text-sm text-gray-300">
                  Phone: {company.phone}
                </div>
              )}

              {company.taxId && (
                <div className="text-sm text-gray-300">
                  Tax ID: {company.taxId}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={() => handleEdit(company)}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                {!company.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(company.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                    disabled={setDefaultMutation.isPending}
                  >
                    <StarOff className="w-4 h-4 mr-1" />
                    Set Default
                  </Button>
                )}
                
                <Button
                  onClick={() => handleDelete(company.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  disabled={deleteCompanyMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No companies found</h3>
            <p className="text-gray-400 text-center mb-4">
              Add your company information to include it on invoices and billing documents.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}