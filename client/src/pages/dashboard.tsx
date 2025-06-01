import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import InvoiceModal from "@/components/invoices/invoice-modal";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="invoice-shadow scada-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  const recentInvoices = invoices?.slice(0, 3) || [];

  return (
    <main className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <Card className="invoice-shadow scada-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-invoice text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-blue-600 text-sm font-medium">Sent invoices</span>
              <span className="text-gray-500 text-sm ml-2">awaiting payment</span>
            </div>
          </CardContent>
        </Card>

        <Card className="invoice-shadow scada-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.outstandingInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-red-600 text-sm font-medium">Draft invoices</span>
              <span className="text-gray-500 text-sm ml-2">ready to send</span>
            </div>
          </CardContent>
        </Card>



        <Card className="invoice-shadow scada-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-purple-600 text-sm font-medium">Active clients</span>
              <span className="text-gray-500 text-sm ml-2">in your system</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <div className="w-full">
        <div>
          <Card className="invoice-shadow scada-border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                <Link href="/invoices">
                  <a className="text-tektoro-orange hover:text-orange-600 text-sm font-medium">View All</a>
                </Link>
              </div>
            </div>
            <CardContent className="p-6">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-file-invoice text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-gray-500">No invoices created yet</p>
                  <Link href="/invoices">
                    <Button className="mt-4 bg-tektoro-orange hover:bg-orange-600">
                      Create Your First Invoice
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:scale-105 ${
                            invoice.status === 'paid' ? 'bg-green-100 hover:bg-green-200' :
                            invoice.status === 'sent' ? 'bg-blue-100 hover:bg-blue-200' :
                            invoice.status === 'overdue' ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <i className={`fas fa-file-invoice ${
                            invoice.status === 'paid' ? 'text-green-600' :
                            invoice.status === 'sent' ? 'text-blue-600' :
                            invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                          }`}></i>
                        </button>
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-500">{invoice.client?.name || 'Unknown Client'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${parseFloat(invoice.total).toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


      </div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </main>
  );
}
