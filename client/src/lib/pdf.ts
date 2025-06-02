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
  
  // Get company info from the invoice (it should include the company data)
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
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          background: white;
          font-size: 12px;
        }
        
        .invoice-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        
        .company-info {
          flex: 1;
          display: flex;
          align-items: flex-start;
        }
        
        .logo-section {
          margin-right: 20px;
        }
        
        .company-logo-box {
          width: 80px;
          height: 80px;
          background-color: #1e293b;
          border: 1px solid #475569;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 4px;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .logo-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .logo-icon {
          margin-bottom: 2px;
        }
        
        .logo-text {
          color: #22c55e;
          font-weight: bold;
          font-size: 10px;
          line-height: 1;
          margin-bottom: 1px;
        }
        
        .logo-subtitle {
          color: #22c55e;
          font-size: 6px;
          line-height: 1;
          opacity: 0.8;
        }
        
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        
        .company-details {
          font-size: 11px;
          line-height: 1.3;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #1e3a8a;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        
        .invoice-details {
          font-size: 11px;
          line-height: 1.4;
        }
        
        .bill-to {
          margin-bottom: 30px;
        }
        
        .bill-to h3 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .client-info {
          background: #f8f9fa;
          padding: 15px;
          border: 1px solid #ddd;
          font-size: 11px;
          line-height: 1.4;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 10px;
        }
        
        .items-table th {
          background: #f1f3f4;
          padding: 8px 4px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #333;
          font-size: 9px;
        }
        
        .items-table td {
          padding: 8px 4px;
          border: 1px solid #333;
          text-align: center;
          vertical-align: top;
        }
        
        .items-table .text-left {
          text-align: left;
        }
        
        .items-table .text-right {
          text-align: right;
        }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .totals-table {
          width: 250px;
          border: 1px solid #333;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .totals-row:last-child {
          border-bottom: none;
          font-weight: bold;
          background: #f8f9fa;
        }
        
        .notes-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        
        .notes-section h4 {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .notes-section p {
          font-size: 11px;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        @media print {
          body { 
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .invoice-container {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            ${company.logo ? `
            <div class="logo-section">
              <div class="company-logo-box">
                <img src="${company.logo}" alt="Company Logo" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
            </div>` : ''}
            <div class="company-details">
              <div class="company-name">${company.name || 'Company Name'}</div>
              ${company.address ? `<div>${company.address}</div>` : ''}
              ${company.city || company.state || company.zipCode ? `<div>${company.city || ''}${company.state ? `, ${company.state}` : ''}${company.zipCode ? ` ${company.zipCode}` : ''}</div>` : ''}
              ${company.country ? `<div>${company.country}</div>` : ''}
              ${company.phone ? `<div>Phone: ${company.phone}</div>` : ''}
              ${company.email ? `<div>Email: ${company.email}</div>` : ''}
              ${company.website ? `<div>Web: ${company.website}</div>` : ''}
            </div>
          </div>
          <div class="invoice-info">
            <h2 class="invoice-title">INVOICE</h2>
            <div class="invoice-details">
              <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div><strong>Service Date:</strong> ${new Date(invoice.serviceDate).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        <!-- Bill To -->
        <div class="bill-to">
          <h3>Bill To:</h3>
          <div class="client-info">
            <div style="font-weight: bold;">${invoice.client?.name || company.name || 'TekToro Digital IIoT Solutions Inc'}</div>
            ${invoice.client?.address || company.address ? `<div>${invoice.client?.address || company.address}</div>` : ''}
            ${invoice.client?.city || company.city ? `<div>${invoice.client?.city || company.city}, ${invoice.client?.state || company.state || ''} ${invoice.client?.zipCode || company.zipCode || ''}</div>` : ''}
            ${invoice.client?.contactPerson ? `<div>Contact: ${invoice.client.contactPerson}</div>` : ''}
            ${invoice.client?.email || company.email ? `<div>${invoice.client?.email || company.email}</div>` : ''}
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 8%">Job Code</th>
              <th style="width: 10%">Service Point</th>
              <th style="width: 8%">AFE/LOE</th>
              <th style="width: 10%">AFE # (if applicable)</th>
              <th style="width: 10%">Well Name</th>
              <th style="width: 8%">Well #</th>
              <th style="width: 18%">Service/Purchased Item</th>
              <th style="width: 10%">Rate/Item Cost</th>
              <th style="width: 6%">Hrs</th>
              <th style="width: 6%">Qty</th>
              <th style="width: 6%">Extended</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => {
              const rate = parseFloat(item.rate || '0');
              const hrs = parseFloat(item.hrs || '0');
              const qty = parseFloat(item.qty || '0');
              const amount = parseFloat(item.amount || '0');
              
              return `
                <tr>
                  <td class="text-left">${item.jobCode || ''}</td>
                  <td class="text-left">${item.servicePoint || ''}</td>
                  <td class="text-left">${item.afeLoe || ''}</td>
                  <td class="text-left">${item.afeNumber || ''}</td>
                  <td class="text-left">${item.wellName || ''}</td>
                  <td class="text-left">${item.wellNumber || ''}</td>
                  <td class="text-left">${item.service || ''}</td>
                  <td class="text-right">$${rate.toFixed(2)}</td>
                  <td class="text-right">${hrs > 0 ? hrs.toFixed(1) : ''}</td>
                  <td class="text-right">${qty > 0 ? qty.toFixed(1) : ''}</td>
                  <td class="text-right">$${amount.toFixed(2)}</td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="11">No items</td></tr>'}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
          <div class="totals-table">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div class="totals-row">
                <span>Tax (${taxRate.toFixed(1)}%):</span>
                <span>$${taxAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Notes Section -->
        ${invoice.notes ? `
          <div class="notes-section">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        <!-- Equipment Purchased Description -->
        ${invoice.equipmentPurchasedDescription ? `
          <div class="notes-section">
            <h4>Equipment Purchased Description:</h4>
            <p>${invoice.equipmentPurchasedDescription}</p>
          </div>
        ` : ''}
        
        <div class="notes-section">
          <h4>Payment Terms:</h4>
          <p>Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}