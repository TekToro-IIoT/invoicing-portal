import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateMasterInvoicePDF(masterData: any, company: any) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Create HTML content for the master invoice
  const htmlContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #1f2937; 
            color: #d1d5db; 
            font-size: 12px;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #374151;
            padding-bottom: 20px;
          }
          .company-info { 
            flex: 1; 
          }
          .company-name { 
            font-size: 20px; 
            font-weight: bold; 
            color: #ffffff; 
            margin-bottom: 10px; 
          }
          .company-details { 
            color: #d1d5db; 
            line-height: 1.5; 
          }
          .invoice-info { 
            text-align: right; 
          }
          .invoice-title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #ffffff; 
            margin-bottom: 10px; 
          }
          .invoice-details { 
            color: #d1d5db; 
            line-height: 1.8; 
          }
          .summary-section {
            background-color: #374151;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            text-align: center;
          }
          .summary-item {
            padding: 10px;
          }
          .summary-label {
            color: #9ca3af;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .summary-value {
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
          }
          .summary-value.total {
            color: #f97316;
          }
          .client-section {
            margin-bottom: 30px;
          }
          .section-title {
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #4b5563;
            padding-bottom: 5px;
          }
          .client-block {
            background-color: #374151;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .client-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .client-name {
            color: #ffffff;
            font-weight: bold;
            font-size: 14px;
          }
          .client-count {
            color: #9ca3af;
            font-size: 12px;
          }
          .client-total {
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
          }
          .invoice-list {
            border-top: 1px solid #4b5563;
            padding-top: 10px;
          }
          .invoice-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            color: #9ca3af;
            font-size: 11px;
          }
          .grand-total {
            background-color: #374151;
            padding: 20px;
            border-radius: 8px;
            text-align: right;
            margin-top: 30px;
          }
          .grand-total-label {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .grand-total-amount {
            color: #f97316;
            font-size: 24px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="company-name">${company?.name || 'TekToro Digital Solutions Inc'}</div>
            <div class="company-details">
              <div>${company?.address || '123 Main Street'}</div>
              <div>${company?.city || 'Calgary'}, ${company?.state || 'AB'} ${company?.zipCode || 'T2P 0A8'}</div>
              <div>Phone: ${company?.phone || '(403) 123-4567'}</div>
              <div>Email: ${company?.email || 'billing@tektoro.com'}</div>
            </div>
          </div>
          
          <div class="invoice-info">
            <div class="invoice-title">MASTER INVOICE</div>
            <div class="invoice-details">
              <div><strong>Period:</strong> ${monthNames[masterData.month - 1]} ${masterData.year}</div>
              ${masterData.client ? `<div><strong>Client:</strong> ${masterData.client.name}</div>` : '<div><strong>All Clients</strong></div>'}
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>
        
        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Invoices</div>
              <div class="summary-value">${masterData.invoices.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Clients</div>
              <div class="summary-value">${Object.keys(masterData.subtotalsByClient).length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Period</div>
              <div class="summary-value">${monthNames[masterData.month - 1]} ${masterData.year}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Amount</div>
              <div class="summary-value total">$${masterData.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <!-- Client Breakdown -->
        <div class="client-section">
          <div class="section-title">Client Breakdown</div>
          ${Object.values(masterData.subtotalsByClient).map((clientData: any) => `
            <div class="client-block">
              <div class="client-header">
                <div>
                  <div class="client-name">${clientData.client.name}</div>
                  <div class="client-count">${clientData.invoices.length} invoice(s)</div>
                </div>
                <div class="client-total">$${clientData.total.toFixed(2)}</div>
              </div>
              
              <div class="invoice-list">
                ${clientData.invoices.map((invoice: any) => `
                  <div class="invoice-item">
                    <span>${invoice.invoiceNumber} - ${new Date(invoice.serviceDate + 'T00:00:00').toLocaleDateString('en-GB')}</span>
                    <span>$${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Grand Total -->
        <div class="grand-total">
          <div class="grand-total-label">Grand Total</div>
          <div class="grand-total-amount">$${masterData.totalAmount.toFixed(2)}</div>
        </div>
      </body>
    </html>
  `;

  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlContent;
  tempElement.style.position = 'absolute';
  tempElement.style.left = '-9999px';
  tempElement.style.top = '-9999px';
  tempElement.style.width = '210mm'; // A4 width
  document.body.appendChild(tempElement);

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(tempElement.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1f2937'
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const clientName = masterData.client ? `_${masterData.client.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '_AllClients';
    const filename = `Master_Invoice_${masterData.year}_${masterData.month.toString().padStart(2, '0')}${clientName}.pdf`;

    // Download PDF
    pdf.save(filename);

  } finally {
    // Clean up
    document.body.removeChild(tempElement);
  }
}