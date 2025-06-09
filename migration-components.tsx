// TekToro Invoicing Components Migration Package
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// COMPONENT 1: InvoiceTable
interface InvoiceTableProps {
  invoices: any[];
  onView: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onNewInvoice: () => void;
  isDeleting: boolean;
}

export function InvoiceTable({
  invoices,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onNewInvoice,
  isDeleting
}: InvoiceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'sent':
        return 'bg-blue-500/20 text-blue-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      case 'draft':
        return 'bg-gray-600 text-gray-300';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-file-invoice text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
        <p className="text-gray-400 mb-6">Get started by creating your first invoice</p>
        <Button onClick={onNewInvoice} className="bg-tektoro-primary hover:bg-green-600">
          <i className="fas fa-plus mr-2"></i>
          Create New Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-tektoro-dark border border-gray-600 rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Issue Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-600">
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => onView(invoice)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{invoice.invoiceNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-white">{invoice.client?.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  {new Date(invoice.issueDate).toLocaleDateString('en-US')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  {new Date(invoice.dueDate).toLocaleDateString('en-US')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">
                  ${parseFloat(invoice.total).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <Select value={invoice.status} onValueChange={(value) => onStatusChange(invoice.id, value)}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-gray-700 border-gray-600">
                    <SelectValue>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="draft" className="text-white hover:bg-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                        draft
                      </span>
                    </SelectItem>
                    <SelectItem value="sent" className="text-white hover:bg-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        sent
                      </span>
                    </SelectItem>
                    <SelectItem value="paid" className="text-white hover:bg-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        paid
                      </span>
                    </SelectItem>
                    <SelectItem value="overdue" className="text-white hover:bg-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        overdue
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(invoice);
                    }}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="View"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(invoice);
                    }}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(invoice.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete"
                    disabled={isDeleting}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// COMPONENT 2: InvoiceForm
interface InvoiceFormProps {
  invoice?: any;
  isOpen: boolean;
  onClose: () => void;
}

const invoiceSchema = z.object({
  clientId: z.number(),
  issueDate: z.string(),
  serviceDate: z.string(),
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
    hrs: z.number().min(0),
    qty: z.number().min(0),
  })).min(1),
});

export function InvoiceForm({ invoice, isOpen, onClose }: InvoiceFormProps) {
  const { toast } = useToast();
  const isEditing = !!invoice;

  const [formData, setFormData] = useState({
    clientId: invoice?.client?.id?.toString() || invoice?.clientId?.toString() || "",
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    serviceDate: invoice?.serviceDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: invoice?.taxRate || 0,
    notes: invoice?.notes || "",
    equipmentPurchasedDescription: invoice?.equipmentPurchasedDescription || "",
    items: invoice?.items?.length > 0 ? invoice.items : [{ 
      jobCode: "",
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

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.rate * (item.hrs + item.qty));
    }, 0);
    const taxAmount = subtotal * (parseFloat(formData.taxRate.toString()) / 100);
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        jobCode: "",
        servicePoint: "", 
        afeLoe: "", 
        afeNumber: "", 
        wellName: "", 
        wellNumber: "", 
        service: "", 
        rate: 0, 
        hrs: 0, 
        qty: 0 
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-tektoro-dark border-gray-600 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId" className="text-gray-300">Client</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {/* Map through clients here */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taxRate" className="text-gray-300">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="issueDate" className="text-gray-300">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="serviceDate" className="text-gray-300">Service Date</Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Invoice Items</h3>
              <Button onClick={addItem} className="bg-tektoro-primary hover:bg-green-600">
                <i className="fas fa-plus mr-2"></i>
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={index} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-300">Job Code</Label>
                        <Input
                          value={item.jobCode}
                          onChange={(e) => updateItem(index, 'jobCode', e.target.value)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">Service Point</Label>
                        <Input
                          value={item.servicePoint}
                          onChange={(e) => updateItem(index, 'servicePoint', e.target.value)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300">Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300">Hours</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.hrs}
                          onChange={(e) => updateItem(index, 'hrs', parseFloat(e.target.value) || 0)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>

                      <div className="md:col-span-3 lg:col-span-4">
                        <Label className="text-gray-300">Service Description</Label>
                        <Textarea
                          value={item.service}
                          onChange={(e) => updateItem(index, 'service', e.target.value)}
                          className="bg-gray-600 border-gray-500 text-white"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-3 lg:col-span-4 flex justify-between items-center">
                        <div className="text-white">
                          Amount: ${(item.rate * (item.hrs + item.qty)).toFixed(2)}
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {/* Equipment Description */}
          <div>
            <Label htmlFor="equipmentPurchasedDescription" className="text-gray-300">Equipment Purchased Description</Label>
            <Textarea
              id="equipmentPurchasedDescription"
              value={formData.equipmentPurchasedDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentPurchasedDescription: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {/* Totals */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button className="bg-tektoro-primary hover:bg-green-600">
              {isEditing ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// COMPONENT 3: InvoiceModal (View Mode)
interface InvoiceModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function InvoiceModal({ invoice, isOpen, onClose, onEdit, onDelete }: InvoiceModalProps) {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-tektoro-dark border-gray-600 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Invoice {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Bill To:</h3>
              <div className="text-gray-300">
                <p>{invoice.client?.name}</p>
                {invoice.client?.address && <p>{invoice.client.address}</p>}
                {invoice.client?.city && <p>{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>}
                {invoice.client?.email && <p>{invoice.client.email}</p>}
                {invoice.client?.phone && <p>{invoice.client.phone}</p>}
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Issue Date: </span>
                  <span className="text-white">{new Date(invoice.issueDate).toLocaleDateString('en-US')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Service Date: </span>
                  <span className="text-white">{new Date(invoice.serviceDate).toLocaleDateString('en-US')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Due Date: </span>
                  <span className="text-white">{new Date(invoice.dueDate).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold text-white mb-4">Invoice Items</h3>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-300">Description</th>
                    <th className="px-4 py-2 text-right text-gray-300">Rate</th>
                    <th className="px-4 py-2 text-right text-gray-300">Hours</th>
                    <th className="px-4 py-2 text-right text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-t border-gray-600">
                      <td className="px-4 py-2 text-white">
                        <div>
                          {item.service}
                          {item.jobCode && <div className="text-sm text-gray-400">Job Code: {item.jobCode}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-white">${parseFloat(item.rate).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-white">{parseFloat(item.hrs).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-white">${parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-2 text-right">
              <div className="flex justify-between text-white">
                <span>Subtotal:</span>
                <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Tax ({parseFloat(invoice.taxRate).toFixed(1)}%):</span>
                <span>${parseFloat(invoice.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2">
                <span>Total:</span>
                <span>${parseFloat(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold text-white mb-2">Notes</h3>
              <p className="text-gray-300">{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-edit mr-2"></i>
                Edit
              </Button>
              <Button onClick={onDelete} variant="destructive">
                <i className="fas fa-trash mr-2"></i>
                Delete
              </Button>
            </div>
            <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}