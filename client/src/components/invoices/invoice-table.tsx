import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceTableProps {
  invoices: any[];
  onView: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onDelete: (id: number) => void;
  onEmail: (invoice: any) => void;
  onStatusChange: (id: number, status: string) => void;
  onNewInvoice: () => void;
  isDeleting: boolean;
  isEmailing: boolean;
}

export default function InvoiceTable({ 
  invoices, 
  onView, 
  onEdit, 
  onDelete, 
  onEmail, 
  onStatusChange,
  onNewInvoice,
  isDeleting, 
  isEmailing 
}: InvoiceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView(invoice)}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-gray-900">{invoice.client?.name || 'Unknown Client'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-semibold text-gray-900">
                  ${parseFloat(invoice.total).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Select value={invoice.status} onValueChange={(status) => onStatusChange(invoice.id, status)}>
                  <SelectTrigger className="w-24 h-7">
                    <SelectValue>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        draft
                      </span>
                    </SelectItem>
                    <SelectItem value="sent">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        sent
                      </span>
                    </SelectItem>
                    <SelectItem value="paid">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        paid
                      </span>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="View"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download PDF functionality would go here
                    }}
                    className="text-tektoro-orange hover:text-orange-600 p-1"
                    title="Download PDF"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Print functionality would go here
                    }}
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Print"
                  >
                    <i className="fas fa-print"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEmail(invoice);
                    }}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Email"
                    disabled={isEmailing}
                  >
                    <i className="fas fa-envelope"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(invoice);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(invoice.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
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
