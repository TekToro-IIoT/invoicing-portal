// TekToro Invoicing Pages Migration Package
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InvoiceTable, InvoiceForm, InvoiceModal } from "./migration-components";

// MAIN INVOICES PAGE
export function InvoicesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  // Query for invoices - replace with TekToro API endpoint
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  // Delete invoice mutation - replace with TekToro API endpoint
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      // Replace with TekToro API call
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      // Replace with TekToro query invalidation
      // queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  // Update status mutation - replace with TekToro API endpoint
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // Replace with TekToro API call
      await fetch(`/api/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      // Replace with TekToro query invalidation
      // queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    },
  });

  // Filter invoices based on search and status
  const filteredInvoices = React.useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    
    return invoices.filter((invoice: any) => {
      const matchesSearch = 
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleCloseForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-tektoro-bg min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-400">Manage your invoices and billing</p>
          </div>
        </div>

        <Card className="bg-tektoro-dark border-gray-600">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-600 rounded w-1/4"></div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-tektoro-bg min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400">Manage your invoices and billing</p>
        </div>
        <Button onClick={handleNewInvoice} className="bg-tektoro-primary hover:bg-green-600">
          <i className="fas fa-plus mr-2"></i>
          Create New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-tektoro-dark border-gray-600">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices by number or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Invoices</SelectItem>
                  <SelectItem value="draft" className="text-white hover:bg-gray-600">Draft</SelectItem>
                  <SelectItem value="sent" className="text-white hover:bg-gray-600">Sent</SelectItem>
                  <SelectItem value="paid" className="text-white hover:bg-gray-600">Paid</SelectItem>
                  <SelectItem value="overdue" className="text-white hover:bg-gray-600">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onNewInvoice={handleNewInvoice}
        isDeleting={deleteInvoiceMutation.isPending}
      />

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          isOpen={showInvoiceForm}
          onClose={handleCloseForm}
        />
      )}

      {/* Invoice View Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={handleCloseModal}
          onEdit={() => handleEdit(selectedInvoice)}
          onDelete={() => handleDelete(selectedInvoice.id)}
        />
      )}
    </div>
  );
}

// MASTER INVOICES PAGE
export function MasterInvoicesPage() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedClient, setSelectedClient] = useState<string>("all");

  // Query for master invoice data - replace with TekToro API endpoint
  const { data: masterInvoices, isLoading } = useQuery({
    queryKey: ["/api/master-invoices", selectedYear, selectedMonth, selectedClient],
    retry: false,
  });

  // Query for clients - replace with TekToro API endpoint
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleGeneratePDF = async (clientData: any) => {
    try {
      // Replace with TekToro PDF generation logic
      console.log("Generating PDF for:", clientData);
      toast({
        title: "Success",
        description: "Master invoice PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-tektoro-bg min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-600 rounded w-1/3"></div>
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-tektoro-bg min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Master Invoices</h1>
        <p className="text-gray-400">Generate monthly invoice summaries by client</p>
      </div>

      {/* Filters */}
      <Card className="bg-tektoro-dark border-gray-600">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white hover:bg-gray-600">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()} className="text-white hover:bg-gray-600">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Clients</SelectItem>
                  {Array.isArray(clients) && clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()} className="text-white hover:bg-gray-600">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Invoice Results */}
      <div className="space-y-4">
        {Array.isArray(masterInvoices) && masterInvoices.length > 0 ? (
          masterInvoices.map((clientData: any) => (
            <Card key={clientData.clientId} className="bg-tektoro-dark border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{clientData.clientName}</h3>
                    <p className="text-gray-400">
                      {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${clientData.totalAmount?.toLocaleString() || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {clientData.invoiceCount || 0} invoice(s)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Subtotal</div>
                    <div className="text-lg font-semibold text-white">
                      ${clientData.subtotal?.toLocaleString() || '0.00'}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Tax</div>
                    <div className="text-lg font-semibold text-white">
                      ${clientData.taxAmount?.toLocaleString() || '0.00'}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="text-lg font-semibold text-white">
                      ${clientData.totalAmount?.toLocaleString() || '0.00'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleGeneratePDF(clientData)}
                    className="bg-tektoro-primary hover:bg-green-600"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Generate Master Invoice PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-tektoro-dark border-gray-600">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-invoice-dollar text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
              <p className="text-gray-400">
                No invoices found for the selected period. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}