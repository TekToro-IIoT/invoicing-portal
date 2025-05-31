import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { generatePDF } from "@/lib/pdf";
import { printInvoice } from "@/lib/print";

interface InvoiceModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: defaultCompany } = useQuery({
    queryKey: ['/api/companies/default'],
    enabled: isOpen,
  });

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    setIsLoading(true);
    try {
      await generatePDF(invoiceData);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!invoiceData) return;
    printInvoice(invoiceData);
  };

  const handleEmail = () => {
    if (!invoiceData) return;
    // Email functionality would be implemented here
    console.log("Email invoice:", invoiceData);
  };

  if (!invoice) {
    return null;
  }

  // Transform invoice data for display
  const invoiceData = {
    ...invoice,
    client: invoice.client || {
      name: 'Client Name',
      email: 'client@example.com',
      address: '123 Client Street',
      city: 'Client City',
      state: 'State',
      zipCode: '12345'
    },
    items: invoice.items || [],
    subtotal: invoice.items?.reduce((sum: number, item: any) => {
      const quantity = parseFloat(item.quantity || '0');
      const rate = parseFloat(item.rate || item.hourlyRate || '0');
      return sum + (quantity * rate);
    }, 0) || 0,
    tax: 0,
    total: invoice.items?.reduce((sum: number, item: any) => {
      const quantity = parseFloat(item.quantity || '0');
      const rate = parseFloat(item.rate || item.hourlyRate || '0');
      return sum + (quantity * rate);
    }, 0) || 0
  };

  if (!invoiceData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Preview</span>
            <div className="flex items-center space-x-3">
              <Button onClick={handleDownloadPDF} className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                <i className="fas fa-download mr-2"></i>Download PDF
              </Button>
              <Button onClick={handlePrint} className="bg-gray-500 hover:bg-gray-600" disabled={isLoading}>
                <i className="fas fa-print mr-2"></i>Print
              </Button>
              <Button onClick={handleEmail} className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
                <i className="fas fa-envelope mr-2"></i>Email
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {(isLoading || !invoiceData) ? (
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-file-invoice text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500">Loading invoice details...</p>
            </div>
          </div>
        ) : (
          <div id="invoice-template" className="p-8 bg-white">
            <div className="max-w-3xl mx-auto">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  {/* Company Logo with Perfect Sizing */}
                  <div className="w-20 h-20 flex-shrink-0 bg-white border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl drop-shadow-lg">T</span>
                      </div>
                  </div>
                  
                  {/* Company Information */}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {defaultCompany?.name || 'TekToro Digital IIoT Solutions Inc'}
                    </h1>
                    <div className="text-sm text-gray-700">
                      {defaultCompany ? (
                        <>
                          {defaultCompany.address && <p>{defaultCompany.address}</p>}
                          {defaultCompany.city && (
                            <p>{defaultCompany.city}, {defaultCompany.state} {defaultCompany.zipCode}</p>
                          )}
                          {defaultCompany.phone && <p>Phone: {defaultCompany.phone}</p>}
                          {defaultCompany.email && <p>Email: {defaultCompany.email}</p>}
                        </>
                      ) : (
                        <>
                          <p>123 Industrial Drive, Suite 400</p>
                          <p>Denver, CO 80202</p>
                          <p>Phone: (555) 123-4567</p>
                          <p>Email: info@tektoro.com</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Invoice Details */}
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <div className="text-sm text-gray-800">
                    <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Date:</strong> {new Date(invoiceData.issueDate).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Bill To */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{invoiceData.client.name}</p>
                  {invoiceData.client.address && <p>{invoiceData.client.address}</p>}
                  {invoiceData.client.city && (
                    <p>{invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zipCode}</p>
                  )}
                  {invoiceData.client.email && <p>Email: {invoiceData.client.email}</p>}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">Qty</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Rate</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{item.description}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">${parseFloat(item.rate || item.hourlyRate || '0').toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">${(parseFloat(item.quantity || '0') * parseFloat(item.rate || item.hourlyRate || '0')).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Subtotal:</span>
                    <span className="text-sm text-gray-900">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Tax:</span>
                    <span className="text-sm text-gray-900">${invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-400">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoiceData.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                <p className="text-sm text-gray-600">
                  Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}