import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { generatePDF } from "@/lib/pdf";


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

  // Fetch the latest invoice data when modal is open
  const { data: latestInvoice, refetch: refetchInvoice } = useQuery({
    queryKey: [`/api/invoices/${invoice?.id}`],
    queryFn: async () => {
      if (!invoice?.id) return null;
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
    enabled: isOpen && !!invoice?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data
  });

  // Refetch when modal opens
  useEffect(() => {
    if (isOpen && invoice?.id) {
      refetchInvoice();
    }
  }, [isOpen, invoice?.id, refetchInvoice]);

  // Use the latest invoice data if available, otherwise fall back to prop
  const currentInvoice = Array.isArray(latestInvoice) ? latestInvoice[0] : (latestInvoice || invoice);
  


  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    setIsLoading(true);
    try {
      await generatePDF(invoiceData);
    } finally {
      setIsLoading(false);
    }
  };





  if (!currentInvoice) {
    return null;
  }

  // Transform invoice data for display
  const invoiceData = {
    ...currentInvoice,
    company: defaultCompany, // Include company data with logo
    client: currentInvoice.client || {
      name: 'Headington Energy Partners',
      email: 'billing@headingtonenergy.com',
      address: '456 Energy Plaza',
      city: 'Calgary',
      state: 'AB',
      zipCode: 'T2P 2M5'
    },
    items: currentInvoice.items || [],
    subtotal: parseFloat(currentInvoice.subtotal || '0'),
    tax: parseFloat(currentInvoice.taxAmount || '0'),
    total: parseFloat(currentInvoice.total || '0'),
    taxRate: parseFloat(currentInvoice.taxRate || '0'),
    issueDate: currentInvoice.issueDate,
    dueDate: currentInvoice.dueDate,
    invoiceNumber: currentInvoice.invoiceNumber
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
          <div id="invoice-template" className="p-8 bg-gray-800">
            <div className="max-w-3xl mx-auto">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  {/* Company Logo with Perfect Sizing */}
                  {defaultCompany?.logo && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-600">
                      <img 
                        src={defaultCompany.logo}
                        alt="Company Logo" 
                        className="w-full h-full object-contain p-1"
                        style={{ maxWidth: '80px', maxHeight: '80px' }}
                      />
                    </div>
                  )}
                  
                  {/* Company Information */}
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {defaultCompany?.name || 'Company Name'}
                    </h1>
                    <div className="text-sm text-gray-300">
                      {defaultCompany?.address && <p>{defaultCompany.address}</p>}
                      {defaultCompany?.city && (
                        <p>{defaultCompany.city}{defaultCompany.state ? `, ${defaultCompany.state}` : ''} {defaultCompany.zipCode}</p>
                      )}
                      {defaultCompany?.phone && <p>Phone: {defaultCompany.phone}</p>}
                      {defaultCompany?.email && <p>Email: {defaultCompany.email}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Invoice Details */}
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-white mb-2">INVOICE</h2>
                  <div className="text-sm text-gray-300">
                    <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Service Date:</strong> {new Date(invoiceData.serviceDate + 'T00:00:00').toLocaleDateString('en-US')}</p>
                    <p><strong>Due Date:</strong> {new Date(invoiceData.dueDate + 'T00:00:00').toLocaleDateString('en-US')}</p>
                  </div>
                </div>
              </div>
              
              {/* Bill To */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Bill To:</h3>
                <div className="text-sm text-gray-300">
                  <p className="font-medium">{invoiceData.client.name}</p>
                  {invoiceData.client.address && <p>{invoiceData.client.address}</p>}
                  {invoiceData.client.city && (
                    <p>{invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zipCode}</p>
                  )}
                  {invoiceData.client.email && <p>Email: {invoiceData.client.email}</p>}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600 text-xs">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">Job Code</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">Service Point</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">AFE/LOE</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">AFE # (if applicable)</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">Well Name</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">Well #</th>
                      <th className="border border-gray-600 px-2 py-2 text-left font-medium text-white">Service/Purchased Item</th>
                      <th className="border border-gray-600 px-2 py-2 text-right font-medium text-white">Rate/Item Cost</th>
                      <th className="border border-gray-600 px-2 py-2 text-center font-medium text-white">Hrs</th>
                      <th className="border border-gray-600 px-2 py-2 text-center font-medium text-white">Qty</th>
                      <th className="border border-gray-600 px-2 py-2 text-right font-medium text-white">Extended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item: any, index: number) => (
                      <tr key={index} className="bg-gray-800">
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.jobCode || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.servicePoint || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.afeLoe || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.afeNumber || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.wellName || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.wellNumber || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-gray-300">{item.service || item.description || ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-right text-gray-300">${parseFloat(item.rate || '0').toFixed(2)}</td>
                        <td className="border border-gray-600 px-2 py-2 text-center text-gray-300">{parseFloat(item.hrs || '0') > 0 ? parseFloat(item.hrs || '0').toFixed(2) : ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-center text-gray-300">{parseFloat(item.qty || '0') > 0 ? parseFloat(item.qty || '0').toFixed(2) : ''}</td>
                        <td className="border border-gray-600 px-2 py-2 text-right text-gray-300 font-semibold">${parseFloat(item.amount || '0').toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-600">
                    <span className="text-sm font-medium text-white">Subtotal:</span>
                    <span className="text-sm text-gray-300">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-600">
                    <span className="text-sm font-medium text-white">Tax:</span>
                    <span className="text-sm text-gray-300">${invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-500">
                    <span className="text-lg font-bold text-white">Total:</span>
                    <span className="text-lg font-bold text-white">${invoiceData.total.toFixed(2)}</span>
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
              
              {/* Equipment Purchased Description */}
              {invoiceData.equipmentPurchasedDescription && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment Purchased Description</h4>
                  <p className="text-sm text-gray-600">{invoiceData.equipmentPurchasedDescription}</p>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                <p className="text-sm text-gray-600">
                  Payment is due within 14 days of invoice date. Late payments may be subject to a 2.5% monthly service charge.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}