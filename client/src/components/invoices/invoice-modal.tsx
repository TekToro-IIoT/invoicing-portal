import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf";
import { printInvoice } from "@/lib/print";

interface InvoiceModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const { toast } = useToast();

  const { data: fullInvoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["/api/invoices", invoice.id],
    enabled: isOpen && !!invoice.id,
    retry: false,
  });

  const { data: defaultCompany, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/companies/default"],
    enabled: isOpen,
    retry: false,
  });

  const handleDownloadPDF = async () => {
    try {
      const invoiceWithCompany = {
        ...invoiceData,
        company: defaultCompany
      };
      await generatePDF(invoiceWithCompany);
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    try {
      const invoiceWithCompany = {
        ...invoiceData,
        company: defaultCompany
      };
      printInvoice(invoiceWithCompany);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print invoice", 
        variant: "destructive",
      });
    }
  };

  const handleEmail = () => {
    const email = prompt("Enter recipient email:", fullInvoice?.client?.email || invoice.client?.email || "");
    if (email) {
      // This would trigger the email mutation from the parent component
      toast({
        title: "Info",
        description: "Email functionality would be triggered here",
      });
    }
  };

  const invoiceData = fullInvoice || invoice;
  const isLoading = invoiceLoading || companyLoading;

  // Debug log to see what data we have
  console.log('Invoice data:', invoiceData);
  console.log('Full invoice:', fullInvoice);
  console.log('Default company:', defaultCompany);

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
        
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-file-invoice text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500">Loading invoice details...</p>
            </div>
          </div>
        )}
        
        {!isLoading && (
          <div id="invoice-template" className="p-8 bg-white">
          <div className="max-w-3xl mx-auto">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src="/attached_assets/tektoro-logo.png" 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-sm text-gray-600">Professional Services</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {defaultCompany ? (
                    <>
                      <p>{defaultCompany.address}</p>
                      <p>{defaultCompany.city}, {defaultCompany.state} {defaultCompany.zipCode}</p>
                      <p>Phone: {defaultCompany.phone}</p>
                      <p>Email: {defaultCompany.email}</p>
                    </>
                  ) : (
                    <p>Loading company information...</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <div className="text-sm text-gray-600">
                  <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber || 'N/A'}</p>
                  <p><strong>Date:</strong> {invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Due Date:</strong> {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{invoiceData.client?.name}</p>
                {invoiceData.client?.address && <p className="text-gray-600">{invoiceData.client.address}</p>}
                {invoiceData.client?.city && (
                  <p className="text-gray-600">
                    {invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zipCode}
                  </p>
                )}
                {invoiceData.client?.contactPerson && (
                  <p className="text-gray-600">Contact: {invoiceData.client.contactPerson}</p>
                )}
                {invoiceData.client?.email && (
                  <p className="text-gray-600">{invoiceData.client.email}</p>
                )}
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 text-gray-900 font-semibold">Description</th>
                    <th className="text-center py-3 text-gray-900 font-semibold">Quantity</th>
                    <th className="text-right py-3 text-gray-900 font-semibold">Rate</th>
                    <th className="text-right py-3 text-gray-900 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3">
                        <p className="font-medium">{item.description}</p>
                      </td>
                      <td className="text-center py-3">{parseFloat(item.quantity).toFixed(1)}</td>
                      <td className="text-right py-3">${parseFloat(item.rate).toFixed(2)}</td>
                      <td className="text-right py-3">${parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${parseFloat(invoiceData.subtotal || '0').toFixed(2)}</span>
                </div>
                {parseFloat(invoiceData.taxAmount || '0') > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax ({parseFloat(invoiceData.taxRate || '0').toFixed(1)}%):</span>
                    <span className="font-medium">${parseFloat(invoiceData.taxAmount || '0').toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-tektoro-blue">${parseFloat(invoiceData.total || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Terms */}
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
