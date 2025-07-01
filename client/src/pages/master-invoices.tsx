import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateMasterInvoicePDF } from "@/lib/masterPdf";

interface MasterInvoiceData {
  month: number;
  year: number;
  clientId?: number;
  invoices: any[];
  client?: any;
  totalAmount: number;
  subtotalsByClient: { [clientId: number]: { client: any; total: number; invoices: any[] } };
}

export default function MasterInvoices() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedClientId, setSelectedClientId] = useState<number | 'all'>('all');
  const [masterInvoiceData, setMasterInvoiceData] = useState<MasterInvoiceData | null>(null);

  // Fetch clients for selection
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch default company
  const { data: defaultCompany } = useQuery({
    queryKey: ['/api/companies/default'],
  });

  const generateMasterInvoice = async () => {
    try {
      let invoices;
      if (selectedClientId === 'all') {
        // Fetch all invoices for the month
        const response = await fetch(`/api/invoices/master/${selectedYear}/${selectedMonth}`);
        if (!response.ok) throw new Error('Failed to fetch monthly invoices');
        invoices = await response.json();
      } else {
        // Fetch invoices for specific client
        const response = await fetch(`/api/invoices/master/${selectedYear}/${selectedMonth}/client/${selectedClientId}`);
        if (!response.ok) throw new Error('Failed to fetch client monthly invoices');
        invoices = await response.json();
      }

      if (invoices.length === 0) {
        toast({
          title: "No invoices found",
          description: `No invoices found for ${selectedMonth}/${selectedYear}`,
          variant: "destructive",
        });
        return;
      }

      // Fetch client details for each invoice to build the aggregation
      const clientsResponse = await fetch('/api/clients');
      const allClients = await clientsResponse.json();
      const clientMap = new Map(allClients.map((c: any) => [c.id, c]));

      // Calculate totals and group by client
      let totalAmount = 0;
      const subtotalsByClient: { [clientId: number]: { client: any; total: number; invoices: any[] } } = {};

      invoices.forEach((invoice: any) => {
        const amount = parseFloat(invoice.total);
        totalAmount += amount;

        const client = clientMap.get(invoice.clientId) || { 
          id: invoice.clientId, 
          name: `Client ${invoice.clientId}` 
        };

        if (!subtotalsByClient[invoice.clientId]) {
          subtotalsByClient[invoice.clientId] = {
            client,
            total: 0,
            invoices: []
          };
        }
        subtotalsByClient[invoice.clientId].total += amount;
        subtotalsByClient[invoice.clientId].invoices.push(invoice);
      });

      const masterData: MasterInvoiceData = {
        month: selectedMonth,
        year: selectedYear,
        clientId: selectedClientId === 'all' ? undefined : selectedClientId as number,
        invoices,
        client: selectedClientId !== 'all' ? clientMap.get(selectedClientId as number) : undefined,
        totalAmount,
        subtotalsByClient
      };

      setMasterInvoiceData(masterData);

      toast({
        title: "Master invoice generated",
        description: `Found ${invoices.length} invoices totaling $${totalAmount.toFixed(2)}`,
      });

    } catch (error) {
      console.error('Error generating master invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate master invoice",
        variant: "destructive",
      });
    }
  };

  const downloadMasterInvoicePDF = async () => {
    console.log("Download PDF clicked");
    console.log("Master invoice data:", masterInvoiceData);
    console.log("Default company:", defaultCompany);
    
    if (!masterInvoiceData) {
      toast({
        title: "Error",
        description: "Master invoice data not available. Please generate the master invoice first.",
        variant: "destructive",
      });
      return;
    }

    if (!defaultCompany) {
      toast({
        title: "Error",
        description: "Company information not available. Please check your company settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Attempting to generate PDF...");
      await generateMasterInvoicePDF(masterInvoiceData, defaultCompany);
      toast({
        title: "PDF Generated",
        description: "Master invoice PDF has been downloaded",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Master Invoices</h1>
          <p className="text-gray-400">Generate consolidated monthly invoices by client</p>
        </div>
      </div>

      {/* Master Invoice Generator */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Generate Master Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="month" className="text-gray-300">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year" className="text-gray-300">Year</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="client" className="text-gray-300">Client</Label>
              <Select value={selectedClientId.toString()} onValueChange={(value) => setSelectedClientId(value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {(clients as any[]).map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateMasterInvoice}
                className="bg-tektoro-orange hover:bg-orange-600 text-white w-full"
              >
                Generate Master Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Invoice Preview */}
      {masterInvoiceData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              Master Invoice - {monthNames[masterInvoiceData.month - 1]} {masterInvoiceData.year}
              {masterInvoiceData.client && ` - ${masterInvoiceData.client.name}`}
            </CardTitle>
            <Button 
              onClick={downloadMasterInvoicePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-gray-400">Total Invoices</div>
                    <div className="text-2xl font-bold text-white">{masterInvoiceData.invoices.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Total Clients</div>
                    <div className="text-2xl font-bold text-white">{Object.keys(masterInvoiceData.subtotalsByClient).length}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Period</div>
                    <div className="text-2xl font-bold text-white">{monthNames[masterInvoiceData.month - 1]} {masterInvoiceData.year}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Total Amount</div>
                    <div className="text-2xl font-bold text-tektoro-orange">${masterInvoiceData.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Client Subtotals */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Client Subtotals</h3>
                <div className="space-y-3">
                  {Object.values(masterInvoiceData.subtotalsByClient).map((clientData, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{clientData.client.name}</div>
                          <div className="text-gray-400">{clientData.invoices.length} invoice(s)</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">${clientData.total.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Individual invoice details */}
                      <div className="mt-3 space-y-1">
                        {clientData.invoices.map((invoice: any) => (
                          <div key={invoice.id} className="flex justify-between text-sm text-gray-400">
                            <span>{invoice.invoiceNumber} - {new Date(invoice.serviceDate).toLocaleDateString('en-US')}</span>
                            <span>${parseFloat(invoice.total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}