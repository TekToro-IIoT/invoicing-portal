// TekToro Invoicing Utils Migration Package

// PDF Generation Utility
export async function generateInvoicePDF(invoice: any) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check your popup blocker.');
    }

    const pdfContent = generatePDFHTML(invoice);
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

function generatePDFHTML(invoice: any): string {
  const subtotal = parseFloat(invoice.subtotal || '0');
  const taxAmount = parseFloat(invoice.taxAmount || '0');
  const total = parseFloat(invoice.total || '0');
  const taxRate = parseFloat(invoice.taxRate || '0');
  
  const company = invoice.company || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber} - TekToro</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid #22c55e;
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: #22c55e;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .company-info p {
          margin: 2px 0;
          font-size: 14px;
          color: #666;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .invoice-number {
          font-size: 18px;
          color: #22c55e;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .bill-to-section {
          display: flex;
          justify-content: space-between;
          margin: 40px 0;
        }
        
        .bill-to, .invoice-info {
          flex: 1;
        }
        
        .bill-to h3, .invoice-info h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: bold;
        }
        
        .bill-to p, .invoice-info p {
          margin: 3px 0;
          font-size: 14px;
        }
        
        .invoice-info {
          text-align: right;
          margin-left: 40px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 40px 0;
        }
        
        .items-table th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #333;
        }
        
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          vertical-align: top;
        }
        
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals-section {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }
        
        .totals-table {
          width: 300px;
          border-collapse: collapse;
        }
        
        .totals-table td {
          padding: 8px 12px;
          border-top: 1px solid #ddd;
        }
        
        .totals-table .total-row {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #333;
          background-color: #f8f9fa;
        }
        
        .notes-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        
        .notes-section h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .notes-section p {
          font-size: 14px;
          line-height: 1.6;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        @media print {
          body { margin: 0; }
          .invoice-container { 
            padding: 20px;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>${company.name || 'TekToro Digital Solutions LLC'}</h1>
            <p>${company.address || '123 Business Street'}</p>
            <p>${company.city || 'Austin'}, ${company.state || 'TX'} ${company.zipCode || '78701'}</p>
            <p>Phone: ${company.phone || '(555) 123-4567'}</p>
            <p>Email: ${company.email || 'info@tektoro.com'}</p>
            ${company.website ? `<p>Website: ${company.website}</p>` : ''}
            ${company.taxId ? `<p>Tax ID: ${company.taxId}</p>` : ''}
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
          </div>
        </div>

        <!-- Bill To Section -->
        <div class="bill-to-section">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.client?.name || 'Client Name'}</strong></p>
            ${invoice.client?.contactPerson ? `<p>Attn: ${invoice.client.contactPerson}</p>` : ''}
            ${invoice.client?.address ? `<p>${invoice.client.address}</p>` : ''}
            ${invoice.client?.city ? `<p>${invoice.client.city}, ${invoice.client.state} ${invoice.client.zipCode}</p>` : ''}
            ${invoice.client?.email ? `<p>Email: ${invoice.client.email}</p>` : ''}
            ${invoice.client?.phone ? `<p>Phone: ${invoice.client.phone}</p>` : ''}
          </div>
          <div class="invoice-info">
            <h3>Invoice Information:</h3>
            <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('en-US')}</p>
            <p><strong>Service Date:</strong> ${new Date(invoice.serviceDate).toLocaleDateString('en-US')}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-US')}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Job Code</th>
              <th>Service Point</th>
              <th>AFE/LOE</th>
              <th>AFE Number</th>
              <th>Well Name</th>
              <th>Well Number</th>
              <th>Service Description</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Hours</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => `
              <tr>
                <td>${item.jobCode || ''}</td>
                <td>${item.servicePoint || ''}</td>
                <td>${item.afeLoe || ''}</td>
                <td>${item.afeNumber || ''}</td>
                <td>${item.wellName || ''}</td>
                <td>${item.wellNumber || ''}</td>
                <td>${item.service || ''}</td>
                <td class="text-right">$${parseFloat(item.rate).toFixed(2)}</td>
                <td class="text-right">${parseFloat(item.hrs).toFixed(2)}</td>
                <td class="text-right">${parseFloat(item.qty).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td class="text-right">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Tax (${taxRate.toFixed(1)}%):</strong></td>
              <td class="text-right">$${taxAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total:</strong></td>
              <td class="text-right"><strong>$${total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <!-- Notes Section -->
        ${invoice.notes ? `
          <div class="notes-section">
            <h3>Notes:</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <!-- Equipment Description -->
        ${invoice.equipmentPurchasedDescription ? `
          <div class="notes-section">
            <h3>Equipment Purchased:</h3>
            <p>${invoice.equipmentPurchasedDescription}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Please remit payment by the due date listed above.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Master Invoice PDF Generator
export async function generateMasterInvoicePDF(clientData: any, year: number, month: number) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check your popup blocker.');
    }

    const pdfContent = generateMasterPDFHTML(clientData, year, month);
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
    
  } catch (error) {
    console.error('Master PDF generation error:', error);
    throw error;
  }
}

function generateMasterPDFHTML(clientData: any, year: number, month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Master Invoice - ${months[month - 1]} ${year} - ${clientData.clientName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid #22c55e;
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: #22c55e;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .master-invoice-title {
          text-align: center;
          font-size: 24px;
          color: #333;
          margin: 20px 0;
          font-weight: bold;
        }
        
        .period-info {
          text-align: center;
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }
        
        .summary-section {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          text-align: center;
        }
        
        .summary-item h3 {
          color: #333;
          margin-bottom: 5px;
        }
        
        .summary-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #22c55e;
        }
        
        .invoices-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        
        .invoices-table th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #333;
        }
        
        .invoices-table td {
          border: 1px solid #ddd;
          padding: 12px;
          vertical-align: top;
        }
        
        .invoices-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .text-right {
          text-align: right;
        }
        
        .total-row {
          font-weight: bold;
          background-color: #e8f5e8;
          border-top: 2px solid #22c55e;
        }
        
        @media print {
          body { margin: 0; }
          .invoice-container { 
            padding: 20px;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>TekToro Digital Solutions LLC</h1>
            <p>123 Business Street</p>
            <p>Austin, TX 78701</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@tektoro.com</p>
          </div>
        </div>

        <div class="master-invoice-title">MASTER INVOICE SUMMARY</div>
        <div class="period-info">
          ${months[month - 1]} ${year} - ${clientData.clientName}
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-grid">
            <div class="summary-item">
              <h3>Total Invoices</h3>
              <div class="value">${clientData.invoiceCount || 0}</div>
            </div>
            <div class="summary-item">
              <h3>Subtotal</h3>
              <div class="value">$${(clientData.subtotal || 0).toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <h3>Total Amount</h3>
              <div class="value">$${(clientData.totalAmount || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <!-- Individual Invoices Table -->
        <table class="invoices-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Issue Date</th>
              <th>Service Date</th>
              <th>Status</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${clientData.invoices?.map((invoice: any) => `
              <tr>
                <td>${invoice.invoiceNumber}</td>
                <td>${new Date(invoice.issueDate).toLocaleDateString('en-US')}</td>
                <td>${new Date(invoice.serviceDate).toLocaleDateString('en-US')}</td>
                <td>${invoice.status}</td>
                <td class="text-right">$${parseFloat(invoice.subtotal).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(invoice.taxAmount).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(invoice.total).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
            <tr class="total-row">
              <td colspan="4"><strong>TOTAL</strong></td>
              <td class="text-right"><strong>$${(clientData.subtotal || 0).toFixed(2)}</strong></td>
              <td class="text-right"><strong>$${(clientData.taxAmount || 0).toFixed(2)}</strong></td>
              <td class="text-right"><strong>$${(clientData.totalAmount || 0).toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #666;">
          <p>This master invoice summary aggregates all invoices for the specified period.</p>
          <p>Please refer to individual invoices for detailed line items.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Date Formatting Utilities
export const formatDate = (date: string | Date, format: 'US' | 'ISO' = 'US'): string => {
  const d = new Date(date);
  
  if (format === 'US') {
    return d.toLocaleDateString('en-US');
  }
  
  return d.toISOString().split('T')[0];
};

export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numAmount);
};

// Invoice Number Generator
export const generateInvoiceNumber = (prefix: string = 'INV-TDS'): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${year}-${timestamp}`;
};

// Status Helper Functions
export const getStatusColor = (status: string): string => {
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

export const getStatusText = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Calculation Utilities
export const calculateInvoiceTotals = (items: any[], taxRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const rate = parseFloat(item.rate) || 0;
    const hrs = parseFloat(item.hrs) || 0;
    const qty = parseFloat(item.qty) || 0;
    return sum + (rate * (hrs + qty));
  }, 0);

  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Form Validation Helpers
export const validateInvoiceForm = (formData: any): string[] => {
  const errors: string[] = [];

  if (!formData.clientId) {
    errors.push('Client is required');
  }

  if (!formData.issueDate) {
    errors.push('Issue date is required');
  }

  if (!formData.serviceDate) {
    errors.push('Service date is required');
  }

  if (!formData.dueDate) {
    errors.push('Due date is required');
  }

  if (!formData.items || formData.items.length === 0) {
    errors.push('At least one invoice item is required');
  }

  formData.items?.forEach((item: any, index: number) => {
    if (!item.service && !item.jobCode) {
      errors.push(`Item ${index + 1}: Service description or job code is required`);
    }
    if (item.rate <= 0) {
      errors.push(`Item ${index + 1}: Rate must be greater than 0`);
    }
  });

  return errors;
};