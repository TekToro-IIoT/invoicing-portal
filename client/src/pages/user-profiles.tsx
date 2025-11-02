import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Users, DollarSign, Shield, Edit, UserPlus, Trash2 } from "lucide-react";
import type { User } from "@shared/schema";

export default function UserProfiles() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateRatesMutation = useMutation({
    mutationFn: async ({ userId, regularRate, overtimeRate }: { userId: string, regularRate: string, overtimeRate: string }) => {
      await apiRequest(`/api/admin/users/${userId}/rates`, 'PUT', { regularRate, overtimeRate });
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
      await apiRequest(`/api/admin/users/${userId}/role`, 'PUT', { role });
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

  const updateCredentialsMutation = useMutation({
    mutationFn: async ({ userId, username, email, password }: { userId: string, username?: string, email?: string, password?: string }) => {
      await apiRequest(`/api/admin/users/${userId}/credentials`, 'PUT', { username, email, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User credentials updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user credentials",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string, email: string, password: string, firstName: string, lastName: string, regularRate?: string, overtimeRate?: string, role?: string }) => {
      await apiRequest('/api/admin/users', 'POST', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsAddUserDialogOpen(false);
      toast({
        title: "Success",
        description: "New user created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
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

  const handleUpdateCredentials = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Only send fields that have values
    const updates: { userId: string, username?: string, email?: string, password?: string } = { userId: editingUser.id };
    if (username && username.trim()) updates.username = username.trim();
    if (email && email.trim()) updates.email = email.trim();
    if (password && password.trim()) updates.password = password.trim();

    if (!updates.username && !updates.email && !updates.password) {
      toast({
        title: "No Changes",
        description: "Please enter a username, email, or password to update",
        variant: "destructive",
      });
      return;
    }

    updateCredentialsMutation.mutate(updates);
  };

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const regularRate = formData.get('regularRate') as string;
    const overtimeRate = formData.get('overtimeRate') as string;
    const role = formData.get('role') as string;

    if (!username || !email || !password || !firstName || !lastName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      regularRate: regularRate || "100",
      overtimeRate: overtimeRate || "150",
      role: role || "user"
    });
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">User Profiles</h1>
            <p className="text-gray-400">Manage user billing rates and permissions</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddUserDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          data-testid="button-add-user"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
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

                <div className="space-y-2">
                  <Button
                    onClick={() => handleEditRates(user)}
                    variant="outline"
                    size="sm"
                    className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Rates
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingUser(user);
                      setIsCredentialsDialogOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Edit Credentials
                  </Button>
                  {currentUser?.id !== user.id && (
                    <Button
                      onClick={() => handleDeleteUser(user)}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  )}
                </div>
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
                defaultValue={editingUser?.regularRate || ''}
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
                defaultValue={editingUser?.overtimeRate || ''}
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

      {/* Credentials Edit Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Credentials - {editingUser?.firstName} {editingUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-400">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                defaultValue={editingUser?.username || ''}
                placeholder="Enter username"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-400">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={editingUser?.email || ''}
                placeholder="Enter email address"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-400">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCredentialsDialogOpen(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCredentialsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateCredentialsMutation.isPending ? 'Updating...' : 'Update Credentials'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newFirstName" className="text-gray-400">First Name *</Label>
                <Input
                  id="newFirstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                  data-testid="input-firstName"
                />
              </div>

              <div>
                <Label htmlFor="newLastName" className="text-gray-400">Last Name *</Label>
                <Input
                  id="newLastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                  data-testid="input-lastName"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newUsername" className="text-gray-400">Username *</Label>
              <Input
                id="newUsername"
                name="username"
                type="text"
                placeholder="Enter username"
                className="bg-gray-700 border-gray-600 text-white"
                required
                data-testid="input-username"
              />
            </div>

            <div>
              <Label htmlFor="newEmail" className="text-gray-400">Email Address *</Label>
              <Input
                id="newEmail"
                name="email"
                type="email"
                placeholder="Enter email address"
                className="bg-gray-700 border-gray-600 text-white"
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-gray-400">Password *</Label>
              <Input
                id="newPassword"
                name="password"
                type="password"
                placeholder="Enter password"
                className="bg-gray-700 border-gray-600 text-white"
                required
                data-testid="input-password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newRegularRate" className="text-gray-400">Regular Rate ($/hr)</Label>
                <Input
                  id="newRegularRate"
                  name="regularRate"
                  type="number"
                  step="0.01"
                  placeholder="100"
                  defaultValue="100"
                  className="bg-gray-700 border-gray-600 text-white"
                  data-testid="input-regularRate"
                />
              </div>

              <div>
                <Label htmlFor="newOvertimeRate" className="text-gray-400">Overtime Rate ($/hr)</Label>
                <Input
                  id="newOvertimeRate"
                  name="overtimeRate"
                  type="number"
                  step="0.01"
                  placeholder="150"
                  defaultValue="150"
                  className="bg-gray-700 border-gray-600 text-white"
                  data-testid="input-overtimeRate"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newRole" className="text-gray-400">Role</Label>
              <Select name="role" defaultValue="user">
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white" data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
                className="border-gray-600 text-gray-400"
                data-testid="button-cancel-add-user"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-submit-add-user"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete <span className="font-semibold text-white">{deletingUser?.firstName} {deletingUser?.lastName}</span>? 
              This action cannot be undone and will permanently remove this user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}