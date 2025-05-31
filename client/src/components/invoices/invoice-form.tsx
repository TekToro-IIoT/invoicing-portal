import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0.1),
    rate: z.number().min(0),
  })).min(1),
});

export default function InvoiceForm({ invoice, isOpen, onClose }: InvoiceFormProps) {
  const { toast } = useToast();
  const isEditing = !!invoice;

  const [formData, setFormData] = useState({
    clientId: invoice?.clientId || "",
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: invoice?.taxRate || 0,
    notes: invoice?.notes || "",
    items: invoice?.items || [{ description: "", quantity: 1, rate: 0 }],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Calculate totals
      const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
      const taxAmount = (subtotal * data.taxRate) / 100;
      const total = subtotal + taxAmount;

      const invoiceData = {
        ...data,
        clientId: parseInt(data.clientId),
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        status: 'draft',
      };

      if (isEditing) {
        return await apiRequest("PUT", `/api/invoices/${invoice.id}`, invoiceData);
      } else {
        return await apiRequest("POST", "/api/invoices", invoiceData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
      const validatedData = invoiceSchema.parse({
        ...formData,
        clientId: parseInt(formData.clientId),
        taxRate: parseFloat(formData.taxRate.toString()),
        items: formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity.toString()),
          rate: parseFloat(item.rate.toString()),
        })),
      });
      
      mutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: "Please check all required fields",
          variant: "destructive",
        });
      }
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
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

  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity.toString()) * parseFloat(item.rate.toString())), 0);
  const taxAmount = (subtotal * parseFloat(formData.taxRate.toString())) / 100;
  const total = subtotal + taxAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <Select 
                value={formData.clientId.toString()} 
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
              <Button type="button" onClick={addItem} className="bg-tektoro-orange hover:bg-orange-600">
                <i className="fas fa-plus mr-2"></i>Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <div className="text-lg font-semibold text-gray-900">
                        ${(parseFloat(item.quantity.toString()) * parseFloat(item.rate.toString())).toFixed(2)}
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
