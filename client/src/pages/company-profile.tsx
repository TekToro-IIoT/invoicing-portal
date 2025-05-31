import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Company } from "@shared/schema";

export default function CompanyProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Get the default company (user's company profile)
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies/default"],
    retry: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    isDefault: true,
  });

  // Update form data when company loads
  React.useEffect(() => {
    if (company && typeof company === 'object') {
      setFormData({
        name: (company as any).name || "",
        address: (company as any).address || "",
        city: (company as any).city || "",
        state: (company as any).state || "",
        zipCode: (company as any).zipCode || "",
        country: (company as any).country || "United States",
        phone: (company as any).phone || "",
        email: (company as any).email || "",
        website: (company as any).website || "",
        taxId: (company as any).taxId || "",
        isDefault: true,
      });
    }
  }, [company]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert logo file to base64 if present
      let logoData = null;
      if (logoFile) {
        logoData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoFile);
        });
      }

      const payload = {
        ...data,
        logo: logoData,
        isDefault: true
      };

      if ((company as any)?.id) {
        return await apiRequest("PUT", `/api/companies/${(company as any).id}`, payload);
      } else {
        return await apiRequest("POST", "/api/companies", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/default"] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Company Profile</h1>
            <p className="text-gray-400 mt-2">Loading company information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Company Profile</h1>
          <p className="text-gray-400 mt-2">Manage your company logo and information for invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card className="bg-tektoro-card border-tektoro-border">
          <CardHeader>
            <CardTitle className="text-white">Company Logo</CardTitle>
            <CardDescription className="text-gray-400">
              Upload your company logo to appear on invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-800">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : company?.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt="Current Logo" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <i className="fas fa-image text-gray-400 text-2xl mb-2"></i>
                    <p className="text-gray-400 text-sm">No logo uploaded</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="px-4 py-2 bg-tektoro-primary text-white rounded-md hover:bg-tektoro-primary/80 transition-colors">
                    Choose Logo
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <p className="text-gray-400 text-xs">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="bg-tektoro-card border-tektoro-border">
          <CardHeader>
            <CardTitle className="text-white">Company Information</CardTitle>
            <CardDescription className="text-gray-400">
              This information will appear on your invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-white font-medium">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white font-medium">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-white font-medium">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-white font-medium">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-white font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-white font-medium">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website" className="text-white font-medium">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="www.yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId" className="text-white font-medium">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange("taxId", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      placeholder="Tax ID Number"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateCompanyMutation.isPending}
                  className="bg-tektoro-primary hover:bg-tektoro-primary/80 text-white"
                >
                  {updateCompanyMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Company Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}