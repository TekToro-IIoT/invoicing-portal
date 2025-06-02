// Print utility for invoices
// This handles the printing functionality for invoice documents

export function printInvoice(invoice: any) {
  try {
    // Get the invoice template element from the modal
    const invoiceElement = document.getElementById('invoice-template');
    
    if (!invoiceElement) {
      // If no template element, create a new window with invoice content
      printInvoiceInNewWindow(invoice);
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check your popup blocker.');
    }

    // Generate the print-optimized HTML
    const printHTML = generatePrintHTML(invoiceElement.innerHTML);
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      
      // Close the window after printing
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
    
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  }
}

function printInvoiceInNewWindow(invoice: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please check your popup blocker.');
  }

  const printContent = generateInvoicePrintHTML(invoice);
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
}

function generatePrintHTML(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - TekToro</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.4;
          color: #374151;
          background: white;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        
        .max-w-3xl {
          max-width: 768px;
        }
        
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        
        .flex {
          display: flex;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .items-start {
          align-items: flex-start;
        }
        
        .items-center {
          align-items: center;
        }
        
        .space-x-3 > * + * {
          margin-left: 12px;
        }
        
        .mb-8 {
          margin-bottom: 32px;
        }
        
        .mb-4 {
          margin-bottom: 16px;
        }
        
        .mb-3 {
          margin-bottom: 12px;
        }
        
        .mb-2 {
          margin-bottom: 8px;
        }
        
        .w-12 {
          width: 48px;
        }
        
        .h-12 {
          height: 48px;
        }
        
        .bg-tektoro-orange {
          background-color: #f97316;
        }
        
        .rounded-lg {
          border-radius: 8px;
        }
        
        .text-white {
          color: white;
        }
        
        .text-xl {
          font-size: 20px;
        }
        
        .text-2xl {
          font-size: 24px;
        }
        
        .text-3xl {
          font-size: 30px;
        }
        
        .text-lg {
          font-size: 18px;
        }
        
        .text-sm {
          font-size: 14px;
        }
        
        .text-xs {
          font-size: 12px;
        }
        
        .font-bold {
          font-weight: 700;
        }
        
        .font-semibold {
          font-weight: 600;
        }
        
        .font-medium {
          font-weight: 500;
        }
        
        .text-tektoro-blue {
          color: #1e3a8a;
        }
        
        .text-gray-900 {
          color: #111827;
        }
        
        .text-gray-600 {
          color: #4b5563;
        }
        
        .text-right {
          text-align: right;
        }
        
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        .p-4 {
          padding: 16px;
        }
        
        .p-8 {
          padding: 32px;
        }
        
        .py-3 {
          padding-top: 12px;
          padding-bottom: 12px;
        }
        
        .w-full {
          width: 100%;
        }
        
        .border-collapse {
          border-collapse: collapse;
        }
        
        .border-b-2 {
          border-bottom-width: 2px;
        }
        
        .border-b {
          border-bottom-width: 1px;
        }
        
        .border-t-2 {
          border-top-width: 2px;
        }
        
        .border-t {
          border-top-width: 1px;
        }
        
        .border-gray-300 {
          border-color: #d1d5db;
        }
        
        .border-gray-200 {
          border-color: #e5e7eb;
        }
        
        .text-left {
          text-align: left;
        }
        
        .text-center {
          text-align: center;
        }
        
        .w-64 {
          width: 256px;
        }
        
        .justify-end {
          justify-content: flex-end;
        }
        
        .pt-6 {
          padding-top: 24px;
        }
        
        .mt-8 {
          margin-top: 32px;
        }
        
        @page {
          margin: 0.5in;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12px;
          }
          
          .text-3xl {
            font-size: 24px;
          }
          
          .text-2xl {
            font-size: 20px;
          }
          
          .text-lg {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="p-8 bg-white">
        ${content}
      </div>
    </body>
    </html>
  `;
}

function generateInvoicePrintHTML(invoice: any): string {
  const subtotal = parseFloat(invoice.subtotal || '0');
  const taxAmount = parseFloat(invoice.taxAmount || '0');
  const total = parseFloat(invoice.total || '0');
  const taxRate = parseFloat(invoice.taxRate || '0');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber} - TekToro</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
          color: #374151;
          background: white;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .logo-icon {
          width: 48px;
          height: 48px;
          background: #f97316;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #1e3a8a;
        }
        
        .company-tagline {
          font-size: 14px;
          color: #6b7280;
        }
        
        .invoice-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }
        
        .bill-to {
          margin-bottom: 30px;
        }
        
        .client-info {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        th {
          background: #f9fafb;
          font-weight: 600;
          border-bottom: 2px solid #d1d5db;
        }
        
        .text-right {
          text-align: right;
        }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .notes {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        @page {
          margin: 0.75in;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="logo">
              <div class="logo-icon">
                <i class="fas fa-bolt" style="color: white; font-size: 20px;"></i>
              </div>
              <div>
                <div class="company-name">TekToro</div>
                <div class="company-tagline">Professional Services</div>
              </div>
            </div>
            <div style="font-size: 14px; color: #6b7280;">
              <div>123 Technology Drive</div>
              <div>San Francisco, CA 94105</div>
              <div>Phone: (555) 123-4567</div>
              <div>Email: billing@tektoro.com</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div style="font-size: 14px; color: #6b7280;">
              <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div><strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('en-GB')}</div>
              <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>
        
        <div class="bill-to">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Bill To:</h3>
          <div class="client-info">
            <div style="font-weight: 600; margin-bottom: 4px;">${invoice.client?.name || 'Unknown Client'}</div>
            ${invoice.client?.address ? `<div>${invoice.client.address}</div>` : ''}
            ${invoice.client?.city ? `<div>${invoice.client.city}, ${invoice.client.state || ''} ${invoice.client.zipCode || ''}</div>` : ''}
            ${invoice.client?.contactPerson ? `<div>Contact: ${invoice.client.contactPerson}</div>` : ''}
            ${invoice.client?.email ? `<div>${invoice.client.email}</div>` : ''}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => `
              <tr>
                <td style="font-weight: 500;">${item.description}</td>
                <td class="text-right">${parseFloat(item.quantity).toFixed(1)}</td>
                <td class="text-right">$${parseFloat(item.rate).toFixed(2)}</td>
                <td class="text-right">$${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No items</td></tr>'}
          </tbody>
        </table>
        
        <div class="totals">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span>Tax (${taxRate.toFixed(1)}%):</span>
                <span>$${taxAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #d1d5db; font-size: 18px; font-weight: 700;">
              <span>Total:</span>
              <span style="color: #1e3a8a;">$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="notes">
            <h4 style="font-weight: 600; margin-bottom: 8px;">Notes</h4>
            <p style="font-size: 14px; color: #6b7280;">${invoice.notes}</p>
          </div>
        ` : ''}
        
        <div class="notes">
          <h4 style="font-weight: 600; margin-bottom: 8px;">Payment Terms</h4>
          <p style="font-size: 14px; color: #6b7280;">Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
