/**
 * TekToro Invoice Module - Complete Self-Contained Invoice System
 * 
 * Copy this single file to your Replit application and use as:
 * import { TekToroInvoiceModule } from './TekToroInvoiceModule';
 * 
 * Dependencies needed:
 * npm install @tanstack/react-query jspdf html2canvas date-fns zod lucide-react
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { z } from 'zod';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save
} from 'lucide-react';

// ========================= TYPES & SCHEMAS =========================

const InvoiceSchema = z.object({
  id: z.number().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid email required"),
  clientAddress: z.string().min(1, "Client address is required"),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  items: z.array(z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.number().min(0.01, "Quantity must be positive"),
    rate: z.number().min(0.01, "Rate must be positive"),
    amount: z.number()
  })).min(1, "At least one item required"),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number(),
  total: z.number(),
  notes: z.string().optional()
});

type Invoice = z.infer<typeof InvoiceSchema>;
type InvoiceFormData = Omit<Invoice, 'id'>;

// ========================= STYLING =========================

const moduleStyles = `
.tektoro-invoice-module {
  --primary: #22C55E;
  --primary-dark: #16A34A;
  --background: #1E293B;
  --card: #2D3748;
  --border: #4A5568;
  --text: #F8FAFC;
  --text-muted: #94A3B8;
  --destructive: #EF4444;
  --warning: #F59E0B;
  
  background-color: var(--background);
  color: var(--text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  border-radius: 8px;
  padding: 24px;
  min-height: 600px;
}

.tektoro-invoice-module * {
  box-sizing: border-box;
}

.tektoro-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.tektoro-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.tektoro-btn-primary {
  background-color: var(--primary);
  color: white;
}

.tektoro-btn-primary:hover {
  background-color: var(--primary-dark);
}

.tektoro-btn-secondary {
  background-color: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.tektoro-btn-secondary:hover {
  background-color: var(--border);
}

.tektoro-btn-destructive {
  background-color: var(--destructive);
  color: white;
}

.tektoro-btn-destructive:hover {
  background-color: #DC2626;
}

.tektoro-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--card);
  color: var(--text);
  font-size: 14px;
}

.tektoro-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.tektoro-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--card);
  color: var(--text);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.tektoro-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--card);
  color: var(--text);
  font-size: 14px;
}

.tektoro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.tektoro-table th {
  background-color: var(--card);
  border: 1px solid var(--border);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
}

.tektoro-table td {
  border: 1px solid var(--border);
  padding: 12px;
  background-color: rgba(45, 55, 72, 0.5);
}

.tektoro-table tr:hover td {
  background-color: var(--card);
}

.tektoro-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.tektoro-status-paid {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--primary);
}

.tektoro-status-sent {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60A5FA;
}

.tektoro-status-draft {
  background-color: rgba(156, 163, 175, 0.2);
  color: #9CA3AF;
}

.tektoro-status-overdue {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--destructive);
}

.tektoro-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tektoro-modal-content {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.tektoro-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.tektoro-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tektoro-form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
}

.tektoro-flex {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tektoro-flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tektoro-text-lg {
  font-size: 18px;
  font-weight: 600;
}

.tektoro-text-sm {
  font-size: 14px;
  color: var(--text-muted);
}

.tektoro-mb-4 {
  margin-bottom: 16px;
}

.tektoro-mt-4 {
  margin-top: 16px;
}

.tektoro-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-muted);
}

@media print {
  .tektoro-no-print {
    display: none !important;
  }
}
`;

// ========================= CONTEXT & PROVIDERS =========================

interface InvoiceContextType {
  apiBasePath: string;
  onNavigate?: (path: string) => void;
  user?: { id: string; name: string; email: string };
}

const InvoiceContext = createContext<InvoiceContextType>({
  apiBasePath: '/api/invoices'
});

// ========================= API FUNCTIONS =========================

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// ========================= UTILITY FUNCTIONS =========================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

const generateInvoiceNumber = (): string => {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
};

const calculateItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

const calculateInvoiceTotals = (items: any[], taxRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  
  return { subtotal, taxAmount, total };
};

// ========================= PDF GENERATION =========================

const generateInvoicePDF = async (invoice: Invoice) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(34, 197, 94);
  pdf.text('INVOICE', 20, 30);
  
  // Invoice details
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 50);
  pdf.text(`Date: ${formatDate(invoice.issueDate)}`, 20, 60);
  pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, 70);
  
  // Client info
  pdf.text('Bill To:', 20, 90);
  pdf.text(invoice.clientName, 20, 100);
  pdf.text(invoice.clientEmail, 20, 110);
  const addressLines = invoice.clientAddress.split('\n');
  addressLines.forEach((line, index) => {
    pdf.text(line, 20, 120 + (index * 10));
  });
  
  // Items table header
  let yPos = 160;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  pdf.setFontSize(10);
  pdf.text('Description', 25, yPos + 7);
  pdf.text('Qty', pageWidth - 120, yPos + 7);
  pdf.text('Rate', pageWidth - 80, yPos + 7);
  pdf.text('Amount', pageWidth - 40, yPos + 7);
  
  yPos += 15;
  
  // Items
  invoice.items.forEach((item) => {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.text(item.description, 25, yPos);
    pdf.text(item.quantity.toString(), pageWidth - 120, yPos);
    pdf.text(formatCurrency(item.rate), pageWidth - 80, yPos);
    pdf.text(formatCurrency(item.amount), pageWidth - 40, yPos);
    yPos += 10;
  });
  
  // Totals
  yPos += 10;
  pdf.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, pageWidth - 80, yPos);
  yPos += 10;
  pdf.text(`Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}`, pageWidth - 80, yPos);
  yPos += 10;
  pdf.setFontSize(12);
  pdf.text(`Total: ${formatCurrency(invoice.total)}`, pageWidth - 80, yPos);
  
  // Notes
  if (invoice.notes) {
    yPos += 20;
    pdf.setFontSize(10);
    pdf.text('Notes:', 20, yPos);
    pdf.text(invoice.notes, 20, yPos + 10);
  }
  
  pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

// ========================= COMPONENTS =========================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { className: 'tektoro-status-paid', icon: CheckCircle, text: 'Paid' };
      case 'sent':
        return { className: 'tektoro-status-sent', icon: Clock, text: 'Sent' };
      case 'overdue':
        return { className: 'tektoro-status-overdue', icon: AlertCircle, text: 'Overdue' };
      default:
        return { className: 'tektoro-status-draft', icon: Edit3, text: 'Draft' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`tektoro-status ${config.className}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

const InvoiceTable: React.FC<{
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => void;
  onView: (invoice: Invoice) => void;
}> = ({ invoices, onEdit, onDelete, onView }) => {
  if (!invoices.length) {
    return (
      <div className="tektoro-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No invoices found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tektoro-card">
      <table className="tektoro-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <button
                  className="tektoro-btn tektoro-btn-secondary"
                  onClick={() => onView(invoice)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {invoice.invoiceNumber}
                </button>
              </td>
              <td>
                <div>
                  <div>{invoice.clientName}</div>
                  <div className="tektoro-text-sm">{invoice.clientEmail}</div>
                </div>
              </td>
              <td>{formatDate(invoice.issueDate)}</td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td>{formatCurrency(invoice.total)}</td>
              <td>
                <StatusBadge status={invoice.status} />
              </td>
              <td>
                <div className="tektoro-flex">
                  <button
                    className="tektoro-btn tektoro-btn-secondary"
                    onClick={() => onEdit(invoice)}
                    style={{ padding: '4px 8px' }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="tektoro-btn tektoro-btn-secondary"
                    onClick={() => generateInvoicePDF(invoice)}
                    style={{ padding: '4px 8px' }}
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="tektoro-btn tektoro-btn-destructive"
                    onClick={() => onDelete(invoice.id!)}
                    style={{ padding: '4px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InvoiceForm: React.FC<{
  invoice?: Invoice;
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
}> = ({ invoice, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<InvoiceFormData>(() => ({
    invoiceNumber: invoice?.invoiceNumber || generateInvoiceNumber(),
    clientName: invoice?.clientName || '',
    clientEmail: invoice?.clientEmail || '',
    clientAddress: invoice?.clientAddress || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: invoice?.status || 'draft',
    items: invoice?.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: invoice?.subtotal || 0,
    taxRate: invoice?.taxRate || 0,
    taxAmount: invoice?.taxAmount || 0,
    total: invoice?.total || 0,
    notes: invoice?.notes || ''
  }));

  const updateTotals = (items: any[], taxRate: number) => {
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate);
    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      taxAmount,
      total
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].rate);
    }
    
    updateTotals(newItems, formData.taxRate);
  };

  const addItem = () => {
    const newItems = [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }];
    updateTotals(newItems, formData.taxRate);
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      updateTotals(newItems, formData.taxRate);
    }
  };

  const handleTaxRateChange = (taxRate: number) => {
    setFormData(prev => ({ ...prev, taxRate }));
    updateTotals(formData.items, taxRate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = InvoiceSchema.omit({ id: true }).parse(formData);
      onSubmit(validatedData);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Please fill in all required fields correctly.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tektoro-flex-between tektoro-mb-4">
        <h3 className="tektoro-text-lg">
          {invoice ? 'Edit Invoice' : 'Create Invoice'}
        </h3>
        <div className="tektoro-flex">
          <button
            type="button"
            onClick={onCancel}
            className="tektoro-btn tektoro-btn-secondary"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className="tektoro-btn tektoro-btn-primary"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="tektoro-form-grid">
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Invoice Number</label>
          <input
            type="text"
            className="tektoro-input"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            required
          />
        </div>
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Status</label>
          <select
            className="tektoro-select"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Issue Date</label>
          <input
            type="date"
            className="tektoro-input"
            value={formData.issueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
            required
          />
        </div>
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Due Date</label>
          <input
            type="date"
            className="tektoro-input"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="tektoro-form-grid">
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Client Name</label>
          <input
            type="text"
            className="tektoro-input"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            required
          />
        </div>
        <div className="tektoro-form-group">
          <label className="tektoro-form-label">Client Email</label>
          <input
            type="email"
            className="tektoro-input"
            value={formData.clientEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="tektoro-form-group tektoro-mb-4">
        <label className="tektoro-form-label">Client Address</label>
        <textarea
          className="tektoro-textarea"
          value={formData.clientAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
          required
        />
      </div>

      <div className="tektoro-flex-between tektoro-mb-4">
        <h4>Items</h4>
        <button
          type="button"
          onClick={addItem}
          className="tektoro-btn tektoro-btn-primary"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {formData.items.map((item, index) => (
        <div key={index} className="tektoro-card">
          <div className="tektoro-form-grid">
            <div className="tektoro-form-group">
              <label className="tektoro-form-label">Description</label>
              <input
                type="text"
                className="tektoro-input"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                required
              />
            </div>
            <div className="tektoro-form-group">
              <label className="tektoro-form-label">Quantity</label>
              <input
                type="number"
                className="tektoro-input"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="tektoro-form-group">
              <label className="tektoro-form-label">Rate</label>
              <input
                type="number"
                className="tektoro-input"
                value={item.rate}
                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="tektoro-form-group">
              <label className="tektoro-form-label">Amount</label>
              <input
                type="text"
                className="tektoro-input"
                value={formatCurrency(item.amount)}
                disabled
              />
            </div>
          </div>
          {formData.items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="tektoro-btn tektoro-btn-destructive tektoro-mt-4"
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          )}
        </div>
      ))}

      <div className="tektoro-card">
        <div className="tektoro-form-grid" style={{ gridTemplateColumns: '1fr 200px' }}>
          <div className="tektoro-form-group">
            <label className="tektoro-form-label">Notes</label>
            <textarea
              className="tektoro-textarea"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or terms..."
            />
          </div>
          <div>
            <div className="tektoro-form-group tektoro-mb-4">
              <label className="tektoro-form-label">Tax Rate (%)</label>
              <input
                type="number"
                className="tektoro-input"
                value={formData.taxRate}
                onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="tektoro-text-sm">
              <div className="tektoro-flex-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(formData.subtotal)}</span>
              </div>
              <div className="tektoro-flex-between">
                <span>Tax:</span>
                <span>{formatCurrency(formData.taxAmount)}</span>
              </div>
              <div className="tektoro-flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>{formatCurrency(formData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const InvoiceModal: React.FC<{
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ invoice, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="tektoro-modal">
      <div className="tektoro-modal-content">
        <div className="tektoro-flex-between tektoro-mb-4">
          <h3 className="tektoro-text-lg">Invoice Details</h3>
          <div className="tektoro-flex">
            <button
              onClick={() => generateInvoicePDF(invoice)}
              className="tektoro-btn tektoro-btn-primary"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={onEdit}
              className="tektoro-btn tektoro-btn-secondary"
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="tektoro-btn tektoro-btn-destructive"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={onClose}
              className="tektoro-btn tektoro-btn-secondary"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="tektoro-form-grid">
          <div>
            <strong>Invoice #:</strong> {invoice.invoiceNumber}
          </div>
          <div>
            <strong>Status:</strong> <StatusBadge status={invoice.status} />
          </div>
          <div>
            <strong>Issue Date:</strong> {formatDate(invoice.issueDate)}
          </div>
          <div>
            <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
          </div>
        </div>

        <div className="tektoro-card">
          <h4>Bill To:</h4>
          <div>{invoice.clientName}</div>
          <div>{invoice.clientEmail}</div>
          <div style={{ whiteSpace: 'pre-line' }}>{invoice.clientAddress}</div>
        </div>

        <div className="tektoro-card">
          <h4>Items:</h4>
          <table className="tektoro-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.rate)}</td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tektoro-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {invoice.notes && (
                <>
                  <h4>Notes:</h4>
                  <p>{invoice.notes}</p>
                </>
              )}
            </div>
            <div style={{ minWidth: '200px' }}>
              <div className="tektoro-flex-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="tektoro-flex-between">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="tektoro-flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================= MAIN COMPONENT =========================

const InvoicesPageContent: React.FC = () => {
  const { apiBasePath } = useContext(InvoiceContext);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demo - replace with real API calls
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      clientAddress: '123 Business St\nSuite 100\nNew York, NY 10001',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'paid',
      items: [
        { description: 'Web Development Services', quantity: 40, rate: 150, amount: 6000 },
        { description: 'UI/UX Design', quantity: 20, rate: 120, amount: 2400 }
      ],
      subtotal: 8400,
      taxRate: 8.5,
      taxAmount: 714,
      total: 9114,
      notes: 'Thank you for your business!'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      clientName: 'Tech Startup Inc.',
      clientEmail: 'finance@techstartup.com',
      clientAddress: '456 Innovation Ave\nSan Francisco, CA 94105',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'sent',
      items: [
        { description: 'Mobile App Development', quantity: 60, rate: 175, amount: 10500 }
      ],
      subtotal: 10500,
      taxRate: 9.25,
      taxAmount: 971.25,
      total: 11471.25,
      notes: 'Payment terms: Net 30 days'
    }
  ]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Mock API call - replace with real API
      const newInvoice = {
        ...data,
        id: Math.max(...invoices.map(i => i.id || 0)) + 1
      };
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingInvoice(null);
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Mock API call - replace with real API
      const updatedInvoice = { ...data, id: editingInvoice!.id };
      setInvoices(prev => prev.map(i => i.id === editingInvoice!.id ? updatedInvoice : i));
      return updatedInvoice;
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingInvoice(null);
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock API call - replace with real API
      setInvoices(prev => prev.filter(i => i.id !== id));
      return id;
    },
    onSuccess: () => {
      setViewingInvoice(null);
    },
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (data: InvoiceFormData) => {
    if (editingInvoice) {
      updateInvoiceMutation.mutate(data);
    } else {
      createInvoiceMutation.mutate(data);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
    setViewingInvoice(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const handleNew = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  if (showForm) {
    return (
      <InvoiceForm
        invoice={editingInvoice || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <>
      <div className="tektoro-flex-between tektoro-mb-4">
        <div>
          <h2 className="tektoro-text-lg">Invoices</h2>
          <p className="tektoro-text-sm">Manage your invoices and billing</p>
        </div>
        <button
          onClick={handleNew}
          className="tektoro-btn tektoro-btn-primary"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      <div className="tektoro-card">
        <div className="tektoro-flex tektoro-mb-4">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search invoices..."
              className="tektoro-input"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="tektoro-select"
            style={{ maxWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="tektoro-flex tektoro-mb-4" style={{ gap: '24px' }}>
          <div className="tektoro-flex" style={{ alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <div className="tektoro-text-sm">Total Outstanding</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {formatCurrency(filteredInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0))}
              </div>
            </div>
          </div>
          <div className="tektoro-flex" style={{ alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <div className="tektoro-text-sm">Total Invoices</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {filteredInvoices.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InvoiceTable
        invoices={filteredInvoices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={setViewingInvoice}
      />

      {viewingInvoice && (
        <InvoiceModal
          invoice={viewingInvoice}
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => handleEdit(viewingInvoice)}
          onDelete={() => handleDelete(viewingInvoice.id!)}
        />
      )}
    </>
  );
};

// ========================= MAIN EXPORT =========================

export interface TekToroInvoiceModuleProps {
  apiBasePath?: string;
  onNavigate?: (path: string) => void;
  user?: { id: string; name: string; email: string };
  queryClient?: QueryClient;
}

export const TekToroInvoiceModule: React.FC<TekToroInvoiceModuleProps> = ({
  apiBasePath = '/api/invoices',
  onNavigate,
  user,
  queryClient: externalQueryClient
}) => {
  const [internalQueryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  const queryClient = externalQueryClient || internalQueryClient;

  // Inject styles
  useEffect(() => {
    const styleId = 'tektoro-invoice-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = moduleStyles;
      document.head.appendChild(style);
    }

    return () => {
      if (!externalQueryClient) {
        const style = document.getElementById(styleId);
        if (style) {
          style.remove();
        }
      }
    };
  }, [externalQueryClient]);

  const contextValue: InvoiceContextType = {
    apiBasePath,
    onNavigate,
    user
  };

  const content = (
    <InvoiceContext.Provider value={contextValue}>
      <div className="tektoro-invoice-module">
        <InvoicesPageContent />
      </div>
    </InvoiceContext.Provider>
  );

  if (externalQueryClient) {
    return content;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {content}
    </QueryClientProvider>
  );
};

export default TekToroInvoiceModule;

// ========================= USAGE INSTRUCTIONS =========================

/*
USAGE INSTRUCTIONS:

1. Install Dependencies:
   npm install @tanstack/react-query jspdf html2canvas date-fns zod lucide-react

2. Import and Use:
   import { TekToroInvoiceModule } from './TekToroInvoiceModule';
   
   function MyApp() {
     return (
       <div>
         <h1>My Application</h1>
         <TekToroInvoiceModule 
           apiBasePath="/api/invoices"
           user={{ id: "1", name: "John Doe", email: "john@example.com" }}
           onNavigate={(path) => console.log('Navigate to:', path)}
         />
       </div>
     );
   }

3. API Integration:
   - Replace the mock data with real API calls
   - Update the apiRequest function to use your authentication
   - Implement the backend endpoints for CRUD operations

4. Customization:
   - Modify the CSS variables in moduleStyles to match your theme
   - Add or remove fields from the InvoiceSchema
   - Customize the PDF generation format

5. Features Included:
   - Complete invoice CRUD operations
   - PDF generation and download
   - Search and filtering
   - Status management
   - Responsive design
   - Self-contained styling

This module is completely self-contained and won't affect your existing application styles or functionality.
*/