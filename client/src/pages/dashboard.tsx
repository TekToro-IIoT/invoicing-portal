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
      <main className="p-6 bg-tektoro-bg min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-tektoro-dark border-gray-600 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-600 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  const recentInvoices = Array.isArray(invoices) ? invoices.slice(0, 3) : [];

  return (
    <main className="p-6 bg-tektoro-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, manage your invoices and time tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <Card className="bg-tektoro-dark border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Invoices</p>
                <p className="text-3xl font-bold text-white">{(stats as any)?.activeInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-invoice text-blue-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-blue-400 text-sm font-medium">Sent invoices</span>
              <span className="text-gray-500 text-sm ml-2">awaiting payment</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tektoro-dark border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Outstanding Invoices</p>
                <p className="text-3xl font-bold text-white">{(stats as any)?.outstandingInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-red-400 text-sm font-medium">Draft invoices</span>
              <span className="text-gray-500 text-sm ml-2">ready to send</span>
            </div>
          </CardContent>
        </Card>



        <Card className="bg-tektoro-dark border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Clients</p>
                <p className="text-3xl font-bold text-white">{(stats as any)?.totalClients || 3}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-purple-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-purple-400 text-sm font-medium">Active clients</span>
              <span className="text-gray-500 text-sm ml-2">in your system</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <div className="w-full">
        <div>
          <Card className="bg-tektoro-dark border-gray-600">
            <div className="p-6 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
                <Link href="/invoices">
                  <a className="text-tektoro-primary hover:text-green-400 text-sm font-medium">View All</a>
                </Link>
              </div>
            </div>
            <CardContent className="p-6">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-file-invoice text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-gray-400">No invoices created yet</p>
                  <Link href="/invoices">
                    <Button className="mt-4 bg-tektoro-primary hover:bg-green-600">
                      Create Your First Invoice
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:scale-105 ${
                            invoice.status === 'paid' ? 'bg-green-500/20 hover:bg-green-500/30' :
                            invoice.status === 'sent' ? 'bg-blue-500/20 hover:bg-blue-500/30' :
                            invoice.status === 'overdue' ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          <i className={`fas fa-file-invoice ${
                            invoice.status === 'paid' ? 'text-green-400' :
                            invoice.status === 'sent' ? 'text-blue-400' :
                            invoice.status === 'overdue' ? 'text-red-400' : 'text-gray-400'
                          }`}></i>
                        </button>
                        <div>
                          <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-400">{invoice.client?.name || 'Unknown Client'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${parseFloat(invoice.total).toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                          invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-600 text-gray-300'
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
