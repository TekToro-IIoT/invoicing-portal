// PDF generation utility for invoices
// This creates a professional PDF document matching the TekToro design

export async function generatePDF(invoice: any) {
  try {
    // Create a new window with the invoice content for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check your popup blocker.');
    }

    const pdfContent = generatePDFHTML(invoice);
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
      
      // Close the window after printing (optional)
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
          line-height: 1.4;
          color: #374151;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .company-info {
          flex: 1;
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
        
        .logo-icon i {
          color: white;
          font-size: 24px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
        }
        
        .company-tagline {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .company-details {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }
        
        .invoice-details {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }
        
        .invoice-details strong {
          color: #111827;
        }
        
        .bill-to {
          margin-bottom: 40px;
        }
        
        .bill-to h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        
        .client-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .client-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        
        .items-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #111827;
          font-size: 14px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table th:nth-child(4) {
          text-align: right;
        }
        
        .items-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .items-table td:nth-child(2),
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) {
          text-align: right;
        }
        
        .item-description {
          font-weight: 500;
          color: #111827;
        }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        
        .totals-table {
          width: 300px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .totals-row.subtotal,
        .totals-row.tax {
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
        }
        
        .totals-row.total {
          border-top: 2px solid #e5e7eb;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 700;
        }
        
        .totals-row.total .label {
          color: #111827;
        }
        
        .totals-row.total .amount {
          color: #1e3a8a;
        }
        
        .notes-section {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        
        .notes-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .notes-section p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }
        
        @media print {
          body { 
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .invoice-container {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="logo">
              <div class="logo-icon">
                <i class="fas fa-bolt"></i>
              </div>
              <div>
                <h1 class="company-name">TekToro</h1>
                <p class="company-tagline">Professional Services</p>
              </div>
            </div>
            <div class="company-details">
              <div>123 Technology Drive</div>
              <div>San Francisco, CA 94105</div>
              <div>Phone: (555) 123-4567</div>
              <div>Email: billing@tektoro.com</div>
            </div>
          </div>
          <div class="invoice-info">
            <h2 class="invoice-title">INVOICE</h2>
            <div class="invoice-details">
              <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div><strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        <!-- Bill To -->
        <div class="bill-to">
          <h3>Bill To:</h3>
          <div class="client-info">
            <div class="client-name">${invoice.client?.name || 'Unknown Client'}</div>
            ${invoice.client?.address ? `<div>${invoice.client.address}</div>` : ''}
            ${invoice.client?.city ? `<div>${invoice.client.city}, ${invoice.client.state || ''} ${invoice.client.zipCode || ''}</div>` : ''}
            ${invoice.client?.contactPerson ? `<div>Contact: ${invoice.client.contactPerson}</div>` : ''}
            ${invoice.client?.email ? `<div>${invoice.client.email}</div>` : ''}
          </div>
        </div>
        
        <!-- Items -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => `
              <tr>
                <td>
                  <div class="item-description">${item.description}</div>
                </td>
                <td>${parseFloat(item.quantity).toFixed(1)}</td>
                <td>$${parseFloat(item.rate).toFixed(2)}</td>
                <td>$${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No items</td></tr>'}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
          <div class="totals-table">
            <div class="totals-row subtotal">
              <span class="label">Subtotal:</span>
              <span class="amount">$${subtotal.toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div class="totals-row tax">
                <span class="label">Tax (${taxRate.toFixed(1)}%):</span>
                <span class="amount">$${taxAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span class="label">Total:</span>
              <span class="amount">$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        ${invoice.notes ? `
          <div class="notes-section">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        <div class="notes-section">
          <h4>Payment Terms</h4>
          <p>Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
