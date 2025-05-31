import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } apifrom "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import InvoiceTable from "@/components/invoices/invoice-table";
import InvoiceModal from "@/components/invoices/invoice-modal";
import InvoiceForm from "@/components/invoices/invoice-form";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Invoices() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
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
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const emailInvoiceMutation = useMutation({
    mutationFn: async ({ id, email }: { id: number; email: string }) => {
      await apiRequest("POST", `/api/invoices/${id}/email`, { recipientEmail: email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });
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
        description: "Failed to send invoice",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleDeleteInvoice = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const handleEmailInvoice = (invoice: any) => {
    const email = prompt("Enter recipient email:", invoice.client?.email || "");
    if (email) {
      emailInvoiceMutation.mutate({ id: invoice.id, email });
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <Card className="invoice-shadow scada-border">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-6">
      <Card className="invoice-shadow scada-border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice Management</h3>
              <p className="text-sm text-gray-500">Create, edit, and manage your invoices</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="bg-tektoro-orange hover:bg-orange-600"
                onClick={() => {
                  setEditingInvoice(null);
                  setShowInvoiceForm(true);
                }}
              >
                <i className="fas fa-plus mr-2"></i>
                New Invoice
              </Button>
            </div>
          </div>
        </div>

        <InvoiceTable
          invoices={filteredInvoices}
          onView={handleViewInvoice}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onEmail={handleEmailInvoice}
          isDeleting={deleteInvoiceMutation.isPending}
          isEmailing={emailInvoiceMutation.isPending}
        />
      </Card>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          isOpen={showInvoiceForm}
          onClose={() => {
            setShowInvoiceForm(false);
            setEditingInvoice(null);
          }}
        />
      )}
    </main>
  );
}
