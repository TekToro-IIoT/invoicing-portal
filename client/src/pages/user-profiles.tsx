import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, DollarSign, Shield, Edit } from "lucide-react";
import type { User } from "@shared/schema";

export default function UserProfiles() {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const updateRatesMutation = useMutation({
    mutationFn: async ({ userId, regularRate, overtimeRate }: { userId: string, regularRate: string, overtimeRate: string }) => {
      await apiRequest(`/api/admin/users/${userId}/rates`, {
        method: 'PUT',
        body: JSON.stringify({ regularRate, overtimeRate }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User billing rates updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user billing rates",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleEditRates = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRates = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const regularRate = formData.get('regularRate') as string;
    const overtimeRate = formData.get('overtimeRate') as string;

    updateRatesMutation.mutate({
      userId: editingUser.id,
      regularRate,
      overtimeRate
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">User Profiles</h1>
          <p className="text-gray-400">Manage user billing rates and permissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user: User) => (
          <Card key={user.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? (
                    <><Shield className="w-3 h-3 mr-1" /> Admin</>
                  ) : (
                    'User'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs">Regular Rate</Label>
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {user.regularRate}/hr
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Overtime Rate</Label>
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {user.overtimeRate}/hr
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-gray-400 text-xs mb-2 block">Role</Label>
                  <Select 
                    value={user.role} 
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => handleEditRates(user)}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Rates
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Billing Rates - {editingUser?.firstName} {editingUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateRates} className="space-y-4">
            <div>
              <Label htmlFor="regularRate" className="text-gray-400">Regular Hourly Rate ($)</Label>
              <Input
                id="regularRate"
                name="regularRate"
                type="number"
                step="0.01"
                defaultValue={editingUser?.regularRate}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="overtimeRate" className="text-gray-400">Overtime Hourly Rate ($)</Label>
              <Input
                id="overtimeRate"
                name="overtimeRate"
                type="number"
                step="0.01"
                defaultValue={editingUser?.overtimeRate}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRatesMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updateRatesMutation.isPending ? 'Updating...' : 'Update Rates'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}