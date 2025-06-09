import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceTableProps {
  invoices: any[];
  onView: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onNewInvoice: () => void;
  isDeleting: boolean;
}

export default function InvoiceTable({ 
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
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-file-invoice text-gray-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
        <p className="text-gray-500">Get started by creating your first invoice using the button above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800 border-b border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-tektoro-dark divide-y divide-gray-600">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => onView(invoice)}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-white">{invoice.invoiceNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-white">{invoice.client?.name || 'Unknown Client'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                {new Date(invoice.serviceDate + 'T00:00:00').toLocaleDateString('en-US')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-semibold text-white">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('New Invoice button clicked');
                      onNewInvoice();
                    }}
                    className="text-tektoro-orange hover:text-orange-600 p-1 ml-2"
                    title="New Invoice"
                  >
                    <i className="fas fa-plus"></i>
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
