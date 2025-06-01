import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

interface InvoiceFormProps {
  invoice?: any;
  isOpen: boolean;
  onClose: () => void;
}

const invoiceSchema = z.object({
  clientId: z.number(),
  issueDate: z.string(),
  dueDate: z.string(),
  taxRate: z.string(),
  notes: z.string().optional(),
  equipmentPurchasedDescription: z.string().optional(),
  items: z.array(z.object({
    jobCode: z.string().optional(),
    servicePoint: z.string().optional(),
    afeLoe: z.string().optional(),
    afeNumber: z.string().optional(),
    wellName: z.string().optional(),
    wellNumber: z.string().optional(),
    service: z.string().optional(),
    rate: z.number().min(0),
    hrs: z.number().min(0).optional(),
    qty: z.number().min(0).optional(),
  })).min(1),
});

export default function InvoiceForm({ invoice, isOpen, onClose }: InvoiceFormProps) {
  const { toast } = useToast();
  const isEditing = !!invoice;

  const [formData, setFormData] = useState({
    clientId: invoice?.client?.companyId?.toString() || invoice?.clientId?.toString() || "",
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: invoice?.taxRate || 0,
    notes: invoice?.notes || "",
    equipmentPurchasedDescription: invoice?.equipmentPurchasedDescription || "",
    items: invoice?.items?.length > 0 ? invoice.items : [{ 
      jobCode: "",
      description: "",
      servicePoint: "", 
      afeLoe: "", 
      afeNumber: "", 
      wellName: "", 
      wellNumber: "", 
      service: "", 
      rate: 0, 
      hrs: 0, 
      qty: 0 
    }],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    retry: false,
  });

  // Reset form data when invoice prop changes
  useEffect(() => {
    if (invoice) {
      // Set form data from existing invoice
      setFormData({
        clientId: invoice.client?.id?.toString() || invoice.clientId?.toString() || "",
        issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: invoice.taxRate || 0,
        notes: invoice.notes || "",
        equipmentPurchasedDescription: invoice.equipmentPurchasedDescription || "",
        items: invoice.items?.length > 0 ? invoice.items : [{ 
          jobCode: "",
          description: "",
          servicePoint: "", 
          afeLoe: "", 
          afeNumber: "", 
          wellName: "", 
          wellNumber: "", 
          service: "", 
          rate: 0, 
          hrs: 0, 
          qty: 0 
        }],
      });
    }
  }, [invoice]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Calculate totals
      const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.rate * (item.hrs + item.qty)), 0);
      const taxAmount = (subtotal * data.taxRate) / 100;
      const total = subtotal + taxAmount;

      const invoiceData = {
        ...data,
        clientId: parseInt(data.clientId),
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        status: 'draft',
        equipmentPurchasedDescription: data.equipmentPurchasedDescription || '',
        items: data.items || [],
      };

      if (isEditing) {
        return await apiRequest(`/api/invoices/${invoice.id}`, "PUT", invoiceData);
      } else {
        return await apiRequest("/api/invoices", "POST", invoiceData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      if (isEditing && invoice) {
        queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoice.id] });
      }
      toast({
        title: "Success",
        description: `Invoice ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onClose();
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
        description: `Failed to ${isEditing ? 'update' : 'create'} invoice`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data before submission
      
      // Only include clientId if it's not empty and not editing
      const dataToValidate: any = {
        ...formData,
        taxRate: formData.taxRate.toString(),
        equipmentPurchasedDescription: formData.equipmentPurchasedDescription || '',
        items: formData.items.map((item: any) => ({
          jobCode: item.jobCode || '',
          description: item.description || '',
          servicePoint: item.servicePoint || '',
          afeLoe: item.afeLoe || '',
          afeNumber: item.afeNumber || '',
          wellName: item.wellName || '',
          wellNumber: item.wellNumber || '',
          service: item.service || '',
          rate: parseFloat(item.rate?.toString() || '0'),
          hrs: parseFloat(item.hrs?.toString() || '0'),
          qty: parseFloat(item.qty?.toString() || '0'),
        })),
      };

      // Only include clientId for new invoices or if it has a valid value
      if (formData.clientId && formData.clientId !== "") {
        dataToValidate.clientId = parseInt(formData.clientId);
      }
      
      const validatedData = invoiceSchema.parse(dataToValidate);
      

      mutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessages || "Please check all required fields",
          variant: "destructive",
        });
      }
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        jobCode: "",
        description: "",
        servicePoint: "", 
        afeLoe: "", 
        afeNumber: "", 
        wellName: "", 
        wellNumber: "", 
        service: "", 
        rate: 0, 
        hrs: 0, 
        qty: 0 
      }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const subtotal = formData.items.reduce((sum: number, item: any) => {
    const rate = parseFloat(item.rate?.toString() || '0');
    const hrs = parseFloat(item.hrs?.toString() || '0');
    const qty = parseFloat(item.qty?.toString() || '0');
    // Calculate extended amount: rate * (hrs + qty)
    const extended = rate * (hrs + qty);
    return sum + extended;
  }, 0);
  const taxAmount = (subtotal * parseFloat(formData.taxRate.toString())) / 100;
  const total = subtotal + taxAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-tektoro-dark border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header Information */}
          <Card className="bg-tektoro-dark border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Invoice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-white">Client</Label>
                  {isEditing ? (
                    <div>
                      <div className="bg-gray-600 border border-gray-600 text-white px-3 py-2 rounded-md cursor-not-allowed opacity-70">
                        {invoice?.client?.name || "Unknown Client"}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Client cannot be changed when editing existing invoice</p>
                    </div>
                  ) : (
                    <Select 
                      value={formData.clientId} 
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue>
                          {formData.clientId ? 
                            companies?.find((c: any) => c.id.toString() === formData.clientId)?.name || "Select client"
                            : "Select client"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()} className="text-white hover:bg-gray-600">
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <Label className="text-white">Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Service Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
              <Button type="button" onClick={addItem} className="bg-tektoro-orange hover:bg-orange-600">
                <i className="fas fa-plus mr-2"></i>Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item: any, index: number) => (
                <Card key={index} className="p-4 bg-gray-800 border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Job Code#</label>
                      <Input
                        value={item.jobCode}
                        onChange={(e) => updateItem(index, 'jobCode', e.target.value)}
                        placeholder="JC001"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Service Point</label>
                      <Input
                        value={item.servicePoint}
                        onChange={(e) => updateItem(index, 'servicePoint', e.target.value)}
                        placeholder="JGK E-72"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">AFE/LOE</label>
                      <Input
                        value={item.afeLoe}
                        onChange={(e) => updateItem(index, 'afeLoe', e.target.value)}
                        placeholder="AFE"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">AFE # (if applicable)</label>
                      <Input
                        value={item.afeNumber}
                        onChange={(e) => updateItem(index, 'afeNumber', e.target.value)}
                        placeholder="20250112"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Well Name</label>
                      <Input
                        value={item.wellName}
                        onChange={(e) => updateItem(index, 'wellName', e.target.value)}
                        placeholder="Visnaga 2314"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Well #</label>
                      <Input
                        value={item.wellNumber}
                        onChange={(e) => updateItem(index, 'wellNumber', e.target.value)}
                        placeholder="2314"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-2">Service/Purchased Item</label>
                      <Input
                        value={item.service}
                        onChange={(e) => updateItem(index, 'service', e.target.value)}
                        placeholder="Sr. Programmer Rate"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Second row with Description taking the full width */}
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Description</label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Job description"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Third row with Rate, Hrs, Qty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Rate/Item Cost</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="$200.00"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Hrs</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.hrs}
                        onChange={(e) => updateItem(index, 'hrs', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Qty</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Fourth row with Extended amount and Delete button */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
                    <div className="md:col-span-2"></div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-white mb-2">Extended</label>
                      <div className="text-lg font-semibold text-white bg-gray-700 border border-gray-600 rounded px-3 py-2 min-h-[40px] flex items-center justify-end">
                        ${(parseFloat(item.rate?.toString() || '0') * (parseFloat(item.hrs?.toString() || '0') + parseFloat(item.qty?.toString() || '0'))).toFixed(2)}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Totals */}
          <Card className="p-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({parseFloat(formData.taxRate.toString()).toFixed(1)}%):</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-tektoro-blue">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or payment terms"
              rows={3}
            />
          </div>

          {/* Equipment Purchased Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Purchased Description</label>
            <Textarea
              value={formData.equipmentPurchasedDescription}
              onChange={(e) => {
                console.log('Equipment Description field changed to:', e.target.value);
                setFormData({ ...formData, equipmentPurchasedDescription: e.target.value });
              }}
              placeholder="Detailed description of equipment purchased"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-tektoro-blue hover:bg-blue-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
