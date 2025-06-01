// PDF generation utility for invoices
// This creates a professional PDF document matching the TekToro design

export async function generatePDF(invoice: any) {
  try {
    // Fetch the actual company data that's used in the invoice preview
    const companyResponse = await fetch('/api/companies/default', {
      credentials: 'include'
    });
    const company = companyResponse.ok ? await companyResponse.json() : null;

    // Create a new window with the invoice content for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check your popup blocker.');
    }

    const pdfContent = generatePDFHTML(invoice, company);
    
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

function generatePDFHTML(invoice: any, companyData: any): string {
  const subtotal = parseFloat(invoice.subtotal || '0');
  const taxAmount = parseFloat(invoice.taxAmount || '0');
  const total = parseFloat(invoice.total || '0');
  const taxRate = parseFloat(invoice.taxRate || '0');
  
  // Use the actual company data from the database
  const company = companyData || {
    name: 'TekToro Digital IIoT Solutions Inc',
    address: '103 South Church St.',
    city: 'George Town',
    state: 'PO Box 472',
    phone: '5872275305',
    email: 'al.doucet@tektoro.com',
    logo: null
  };

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
          gap: 20px;
        }
        
        .logo-section {
          flex-shrink: 0;
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
            ${company?.logo ? `
              <div class="logo-section">
                <img src="${company.logo}" alt="Company Logo" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px; background-color: #1e293b; padding: 4px; border: 1px solid #475569;"/>
              </div>
            ` : `
              <div class="logo-section">
                <div class="company-logo-box">
                  <div class="logo-content">
                    <div class="logo-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#22c55e">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                      </svg>
                    </div>
                    <div class="logo-text">TekToro</div>
                    <div style="color: #22c55e; font-size: 6px; font-weight: normal;">DIGITAL</div>
                  </div>
                </div>
              </div>
            `}
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEwWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA1LTMxPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmZiNjkxOWZiLTdkYTYtNDk2MS1iMDRiLTNlNjM1NGVmNmQ4MzwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZCBkZXNpZ24gLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkF3YWtlbmVkIFRyYWRlc21hbjwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhIChSZW5kZXJlcikgZG9jPURBR3BDT0U0RngwIHVzZXI9VUFENXVCOVdNOWcgYnJhbmQ9QkFENXVBZTZpMHcgdGVtcGxhdGU9PC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PlUQCaMAAECHSURBVHic7NUxDQAwDMCwlT/pgegxLbIR5MscAOB78zoAANgzdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACDB0AAgwdAAIMHQACLgAAAD//+ydeZxcRbXHv+f2TBKyk0BAdoJAIosgu2xJFAQUBCF5igsILo/nLs/n/pjoU3z6UJ+7PHANKgmLLLIqDLso+74lLCEhCyEbWWamb533x6k7fdPp2TLTPZOe8/18Oj3pvl23bt269as6deqUC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7jOHWAC7rjOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d4ILuOI7j1AEu6I7jOI5TB7igO47jOE4d0GNBP+KKU8YAI1UFEa1ClnqHgiQqy+94dN81ADQ19W+G+pB33vrhrZKEsSKiDLCyFxVUQUQkpEHTttYF1x1zyXr7sp8z5ziOMwho6PlP5BQVfijCaBABdCBJi4AE9DMH7vjSjwG5D0J/56mvaGwo/KixseF9gDJwZLI9L6q6OgR9WER+iDS+DAhCj6qHDqja1DEiA6X4BzebS30BrzNO9emxoKuESyFpRfVDCocAI8mU3aps9ojVuvaqQFC0QUTaRk6cV+PTVx+FFkBVNfRL67Bh46lkWVB9PYTwSBr0963r11+ZhiXLHtrvIXoq5pHNodXbfFSk/tkc6gt4nXFqQI8F/a5Vo9cxb9c/HL7/o3ckQaYF0TNBDwOGiI2Gk9wT1j8Pm9ZrV7j9ukQgqeGJN+ijqaACiaqmQfWhkIaLQ7H410lTJsz9Lt/l2JuO5ejbjtY5zOnZSVRHAycBjQzsBvBOVX0OfNQ1ADgZ2JKBa4lLgGeAe1W1KANxntKpG3pucn9+Igg0jnltoS6dMEsbizcCpyryJVS3x0bKqEgiqtkozlu9zZVoUFdVEUQRFFVJleXFNP2+kv6m2NK2eF1hosJ6BbjpHTf17BSlkf82qvojEWns24voc84BnsPqtTfQ/UsTMJGBNQ1VzizgYWANXl+cKtJzQY9OZs2QMm9X4XdnLJ7+psd/+nISrikU+CzwAZQtURShoKBifw/Uh83pHI2CmwJoCCuKGq5qW7V+5pphb3zp6CkqzTRzG7O0uQ/usIgUgBEMzIYvy1NmHXFB72dUNRGREdgIfSC2MUqpnfW64lSV3pltJz6vNDUpIC++sMv8tiHr/wPV00B/J6ILVCUIipqVSfEKvbkQ75Wqoir2/6VpSC9vKxbfv764/hNvOW7X+UAyU2bqbXKb9mFTmhfLgfZK4qvbV2slqKKqA1FsBhSbUkZSmvPo77pR6UXZ312Sry+1cvjbnOtoX5ZXf5Z7X52zT+Zh58yYowtfH8W9ez9WvHPJhDsUvqAiHxF0liKr4mEanapc2Acm2v6uoBDM1s6aNA2XFYttZ7e2tX1qZTrvphuOmrUeoHlqU5/PW8aK3RcNS6XGtaZsjg1kfxAbtq6OEVWt1F711T2uJMB9lWa3iPWlX+tMLQWtCmySnmXC2teZ6SF9osWbsGytA5qaFD0P3rBIC+OXrSg2jPtrsljuVcIsVL6i6OEi0qhoiKuoVfp6ft0WQjNw/WN6S3Uqnbk6CGoT5QGRBFWKIdwf0nB+SMOtdz1yx/I373N6AXlBAb4p36zGU68i0gYU6f1NbGDjupX2Mt3smjtNI9c4KLAVcAQwSVXHUltnxg2yBdwMNItIsf1D1QLwSWAnrHwUGAb8Drgfquv4l+vAKXCKqh6hqsX8eaOQvwZcBCwpS6IVux9tbEJbEs+vItIAFCjdYwFSVU3zeelp8tj97vJZiXVGgS2Ag4H9gAmqWhV/kqzcRSTF5vafAO4CFgHR/WljB75cPvcEzopTHjXvAeTytw6Yh+X9hdx1dStPuesBewaOBN6oqsP7PtclfyERIYTQkiTJAuBe4DFVDfQg75XoO0EHmDkTgNuzBq/pvNf3PvXym8c+vec/tMDpquELgmyn0Chihvg4vw59IOzmtqVogq567o2kKvDQctjv4d4m3W+cp+cBiCA8eOfL1RgRaxTz6PtGGkJYVAzFH77euu7CkOy5asoU5Jqpv+ZWvpH29flhg4b7JeCt9E70EkyQfgIclPt8FeZAdRO9r2sLAERkg/uRG9koMAY4XVU/LyIT6UdLAaUGaz1wh6qmuUYjUdWPi8hkNhSzh4EHyn7ft5my8ipgIvYJ4JtAQzSjt59TROYD3wJWWnXdoME7Dbvfm5TH6LOxAqsbH9eSIqTAH0XkAqyzsKkIsBxY00VDPQw4ACuDw4AhVLG+lHVQFAiq+qKI/By4GFieiV0HnZndgS/IJvZ0ekvutJkz5KvAbKz8lkZx7Cjv5ZbAbYDPAGfGv6v2rObzkyTtzdwqoBn4T+BJVW2jk7x3Rt8KejnnzQw8trckq0etuv3FXX7x1n0fvlqEjwicosoeIjqsvTMIvS5CUcREPew9fPyynZesHT4fkCm3TqF5avNmZUdqamqCj1uJPH7vwiHFYtizkMiu9FVFix0piZoOUgwang0hXNtabLvooAN2fe7Jv8DibZAmaapJ2YlIq6o+3QdJjQNej52VTByKwGLgqT5Iv7OHTYBJmACdEhtxpR/NRnE0E7AR7Eb3UkRWx8/TWGYNmIhVU8gFe/h3E5FPAx8ECqoaYtlmt+9erKG7FSv38jz1NuBEZtJbAmSWKoh+I1h9ae3lOSqWY351B2Yl+QIm5JnAkuWpmmQWOhHZFfguMBX4MvBIJz8rYnWkUNXMdUHuGR+PrT6ZAvw78DegLRuwlP0GSj4xRwAXAG+JXwdq72A5EjgROBzrWP4eWFUp710RXfOfwGP7PKa3v7iLosrd7/zLwmJjy/mq+mFE/keRF1VUYsSSQGmefVPPJ4KiJB9Q+PnWI9Z/8IjnJo1VUeH+twhNTf09T9Itps+eLgu2WyAAD939ws5pql9MkuTXSZIciqK96BVbS1VqSRRBVPWVNE1/mBaLZ7WtXTfzkYm3PAcw+SlonlobMe9DsrJJciP/7POqj5JDCBOBb6nqO9lwxJtE03HNXyKSOfF1dO3Z94Xc31WhbGR0qIj8VFXPIgtQZSNmiX9fiTXSf6N6vjdZG9iQy1+W174qj45+L5gl5xPAZ1Q1E3OJpuzs3tWifiS56z8OE7nJMS8d5b2QSyf/dy3rdnberF3bE+uUHNlBmWcoZg38X2x6I6Mm11LWFmSDji2B84D3AkO7yH9FqjtCz7ClbkoTjBrS2jaydcjDi5GnSJI/JqH4WZD3quhoQVIsWGiiaM+FS6PaqY5QkWOEcBiF1vcWl2/5Q0atvgFg+uzpCRDmzOhZ0JOaoMj0OdMFCPN3XDt+yXPz318oDPlcIUm2AYbGxX/CpiwD1CjmVq4p0BCCrgkhvSItFr+nQeYNe/X1dXHCTptGNfXppXWX3s7HdeLQ0y4I1Zjziw/osCRJzlDVE9hwDj+bG+vPDuVAcLgCa8AC1mj9AJgQiyyhZEkpAr8EvoONnDs0/fZBfSl1bjs5rK/rTM7P4q3AR4Hh1nS1z+lDtQdcG2JBwaJ1BDgqTsV8HXidzssnE6T+ql/550tUdU8R+STwNLCQja1jCbAtZmZ/U2mQ326tqXq55+pyZg3IzFJbxrzfBTzW03RrI+gZAjdzswI6ffb0lqVbL31y3dKt/62hofhbUb6s6FGCjFJIBUliFcmPcrpIX0RMsQrRkD9SlWMFOfaIl3a5jP0e+e5C5fH7n9yzhZYhyvlfsbT7cQOX3XV33s/7aW4mGXL5Alq31ZGJ6NEjkuQ/JUn2F5EkNjpSclzrvjDk5gStFbE0WoPqP4qt6TdWrQi3MGaXtqOnajJTZm5uo/EBQSziAGwHzIiBcfKOcSk2T7eSksNRTbMYX8tredL2k5c6WVmMgY8CXwPGUhqRZx3NVcAP42tNuZ9CnTEE+BAwgQ07LQqsBZYRH+Eq1hcFRmGWgqzeClAQkeNVdbaI/L0L828m5uuxaa2a3LNYLkMwc/vQ3GcFbNrgYODKvN9FbjrlYKzTUogWiow2zAFzHVXqoOTuZyHmfRg2agfrTOyFdXi/Tg+tUrUV9BxzZswJKHLq5afq5SPW3H3ImnGnNyZtxxPCGSIcqMhWANLuud7NHqBk8/FWYALBtgLjNGyO4rIDJj91qV538sN3q649YLtXeHnRNrp428XVutQOmT57ujzEQzw2fyUjZcXWjVsnB0uhcEaSyAkgwxACCoIksWPTfS3XnFNRe+ePlSGEB0La9sf1a9tmj3+Hvv7anTtKQ1GZKTPrueGsNtkIZQqwR+7zgM3lzwYuFpGXoPpzoh2gwGqgrZZeyWUm9l2Bz2Hz5VnwoLyQvQicj80h9sVKhwFJTlS2A44l166papuI3KUWMfF+IK1BfdkK+DBwBtbJykR9JxE5GPhnPK6j+5Hdx4eAj2FOalXPdCyXkVj433/D8puddxQ2dfAXrC5lDr2COWG+DRhf5oC5GPg5cCnWsaymY1y2muRo4NPAPrEjkuXlOOAb9NB/o98EHQBBL9fLlZuOlXu3fvn1k1/d6rKlJLehTBN4H8LbQYbG2pKZmu2X3UkdUDEPcTUHsG0FPoxyPBRvOHy/R/+QpPIg0Mp3vghf/O++DJDSMQrncI4s//NyJt1x5NCirHrHkMaG9yVJMg2RcVKaE0pK4du7mbNojtc48IkDc0Kqt2ka/tCqxZvWhu0WvPSOS8N4DuXOI74T+tcQWxfkBR1KD6Viy8S+gXnG97cFZJM8Zzf5ZBsuSZuCObcdgY1MMtHITI53YfOHt7ChyNcjWZkcgjlw5j36XwG+ISJ3UhKharMIc+IcQ3ROjHkcAuwb39d1I51WTMwXU9u6/jMsj/+BdRSzirMvMBxYkRsVZ4J+ACX/ABWR9ar6axH5AbUN0bsQK7cfYqP1LO97YnPqPRpp1nKOpjICvOMm5Yg7FQh3PTlp6bqRq+eocLbCWQoPCJqgSgw/YW6o3SxuyRxswFzAUFHR3UT0X1FmaUG/ufvtR28D6OF3HS5Tbp1S1VbkxKtPbHeCWDV22CENhcLvGgqFiwpJ4VRgfOyyZE5BPZv3VPMiULJlSZqkxfBMa7H4kTSE01fpyt9OPGrU/KRhSJjLXL1ELqlNB2bwsCtsYIJvxbyzF1Aye/fnq9YkQIOqng78n6pOwTzZs3qdrXu/DhthNVP/Yp5nT9jAUVVU9SFs/X9WNrV6LcPq6ko2rCs7YAO/7lpL8lNNtXqtxZaj5sVPMAvIaEoWBLCiblDVNxDrWZzWWSoit8W0apn31pj3lynpccA6JiO6VeI5+neEnkfgz/wZ+HN4oKlJ2e/BVyfv8cyfiutGzJ7w0o7/JsInBdkV1cTmyNHcbereiF3I+c3RIOiuIF/QxuIHjtjjmW8Vlo+7tCVtXM7M/9Tpk58MAL11nmtqakKnKXKk0NxMAzJf3n3b2bssaih+bviwoR9BaBAlgEXBigagHji9KaoxVA8gMWhICOGVYjFcnKbpD1ratlo5tOXJ5G/vujb8bVC0kzUnawDHQPu8iGKN8vLs+8EgUrn58gRrkD4mIl8BxmSOXtHknwX5mQOcSxzVDYYyyrFV7u+sjizB5qKJ/69FPrJOxXJsJJ6Z3cFGsz3156xZfc9NXywjlltuND4M8wtox/wOzYEV2pdOBhFpwaakat2hVFVdqaqrKpyzx0GFBo6g57H48Ow9e3oy54m9wvod5v9sxy1X3iCE95PwblF9kyKN2cJzbbeod03W2MZ5dlHVgLAtyA+Kxcb3JvCrI/d59BaKDS+ubWtMYl50UxznptzaxKPLVPZBuP/GFxvHDpfJkhTenSTyQRHZLXq5BZAo5tr97gmY8Fv9i++EEMJzIehNxTT9zYIVDz100kknaXMzhZuPvbZW5zunf0bDfUJZo5IfbXVJ2Xz5Lth8+dmYw1I2Klc7VJeKyG8wT/bVFc49qJCeTq1Vj43O38nKkYHEUMz6ky/LVipPW+SvcUB0IvsqDwNT0CNzZswJNO3F/Jd31N12mzt3zWvjvj2U5EoVPUnQGcAk0AbaDfDtst5V6bSPf9vXKkODwFtR3VuF+15pKP4hNLbdQAyFGK0B3avZCudyrtzfjC4fuqjwYCju0TiycYaInixJ8iaQQpzb1piFLDfdSbs9pBuC2iw5QUOYH4JeGUK4YvnqdfdN2mZk2wFHnaQAzVObXMxrS6c3skz4+v7kfeP0lpn/ehLbOxPtw1X1qyJyDCVzZ36+/FkROR/4A9G0XEtHvYHMpgQT2Vyocr3P5pyh1AFdgS25y39WTl0V9oAWdKC0hv3WKTw77Zbiih9/6rG37vPYMwJ/RnkfwicEGY0dpWa6lvycSVdEEwugKoiMBqapcKDAmW9988M/Cmly3T/TwroTrj4huebEazp1Ipty63nSdtc6ODzV4cnjw4aOHf3ppFB4v4jsIZIMUdV2H8yer7MnCwSjWOzcJGiahqAXapr+Rov65G77Tlj7y9E/1UmPvp8maepR8k5NGZAClhvh5KPKdTevDcBJwEysgYWSmKdYJ+FxzMR+K+Z9XLcCtrmTiyDXp8n2ZWKRXYGPAFvn2tQAzMUc3JKy5Y8DtsL1NjrgwBf0SPPUZgCFb+r2s6e3pCpPXDFhyVcPXz3+16T6DVRPEhimGpepAXH82r35dQBp37ldRHUkcJSIHCaFcN2h15zUtFx48qQr3tM2dHZBAZ0zfQ4ITJ89HYA7jrxDxj3wXGHViKFD594l7xjWOPZ7iSQTRSS1UOkkgvQ8dn0pKAwoIc4UtBbT0Fwspl96YofbH9nlhQ8kaUH0+1vbdMWFXNjt5J3aER3C9qDk7d2XNAAvYE5mm0SuQTwGmwNvoOTAU/En8V2xtb0zKHka5xtXsGVNH8Q2AnEhHyTkLDxbYkvMhtK7JYn5irM18H4s3LJCe0wDAf5B78P2blZsNoKeZ86MOTanPWGJ3HXi5c8dNHvGmUMai9MUzhTRo0C2Je5cQ2kLtu4gZE5p0GDrwLUgwkkg01CdtTzRP6kUH5yQFtaMXzZep82eZr+DcNAz79xaxyRHjRbOTJLkbSIyVJUQwzj20NmNLApu3A6o/alYmabp3WlIf9tSDDf+fb9bV41f1iBH3inaFH0PnAGNAEdh4SlH03ejhcxqdTO9EHRKEdvOjK9NItcxUGyO/Crgi0RPZBfzQckOWKjVkX2dcD7gVpy+eQJbg54OpumczVLQgXbHORTmvbBL27Rdn7/x5ST8s5Do4ZrwATEBHqe2qZuK9GCJnrRPxieKrQNT0ZGofEThGNDrFjcUL512y7S/A7pyzLDRw4cPmdaYFD6QiBwpIuNsg1js1Fnr1SNnN/vDRuOIKquD6l1omFVsSW9ZneychcSUuW+cq000dfvynH5FKQVNSem7UXrAok31xYik3XltE35X7ki3WFV/CvxMRJZDn83xO5sJ7X5KNsiquEFQb5KP58jqbBbMaZaIPNuH59ks2HwFPUNg2uznFeCeR/d+DZGrj9j/0XtE00MCyWdF9EiURoVUVJI4eR1/2Y3kbbFb9KbXgsBEkH8FOXlhY3rZqBEj/jli+BYzkoTDRSy6nVKy9Hd3nrw9wAHteUvFwr6Spun9IYQL0pTb79nv+lc+NfbjNDdbg7tiyxd7WGBOf1MW5KKvhqoJpdgFvSHvf7KpaWXhShVb31ujiLwWLVV1Gf3N6Tad1vmyZ2OD9eO5z8qPz/toJKr6B1W9UETWlh9f72z+gs4Ga8UVoOHWKcubG4rXHv3qVn8thuS9JHxdYCcL8w5AQo+izkncEiXzZ9MGEdlB4POIUigI2KirZFqnB8Z1hbiTuyga7FygQRcUi8UfrFy0+mfjp4f1K27bu7DPQx/XpqlN3S0aZwCS01zNbQ7SW4KU4v73CZnHdWdJZt/n3pX4HMT/7wP8QlU/hO31nMS89lU2nQFOhfpTsZrmHPA6qxy2qmfD5WnZOvr1IvJ9Eflau1F0kNWzuhD0cpqnNBe58wi57eH9Wqa/6fHfLiq0/iWE5CxguiKTBYYqJPFWd9cjvr1uxKVimXkno0FyTnXdzWsWICrajVJUgwZ9Ng3hqpZietE63fn5KdPRR3lUbjt6Zjpw/TOdHrAaeBYY2Qcj6jwiFjq0V2lgdXuhiKygG0am+L2KyChsF6tGStYCxbanvEZVzxWRm4E19bw8y+mQVszzfEQX935rSmFQ25U/1plXgNdEstgdkmLL0x4WkdnAndnxg7F+1aWgm+jdqXAnzJ4udzy0/6sH7PnU97cY1voXVT0ZOEWE/WN4mbgYnO5vS1oa2Zcf26NROTa3r6jFXtdUnwmqV6dpuEJTHj7kmZ1bm/dEmqRpU+YznYGJYku25tH3y2cSer+jWrZ95M+B6yk5yXWFAttgu0Sdwoae7optnPFLzCnq/4CluRG9U8fk5tBfxjZvyVZOVDwcOBT4Eha6NUOjBeppsb0Rsi1di8BSLIY8W/58g5H6FPQc5hG/F/cPW188atxrT7B8y7lBkz+i8i8q+lFgZ7LKJVFeoSfS3G00M9prdHgXSVEppKrLQpr+RlR/29pWfH7Z8HHrwqF3Kc/sqM1T3XO9nomm6GXYFo3VaHl6W1+y388HHqQnrpzm4Hcf8BzwZSy8Zn6/5/GYp/vO2PapS/JbWzp1zzrgYbquU09i9en7qtoQLT3ZVM1BwDuwXfnWULKS1izc7ECm7gUdaA9Oczu2Dzswd85LO337iN3mXoIm/w6cgegIVEN0sUg079nWF8T0LNSsqCASQtAQwp/T1paZW08d8vCv+JWcNue05C9v+20A+Af/6PRVO9UnN6/XqUDljhlwQlZ2DXGFSPceA1UtYiOlbwLPqepFIjIsppNtSpTth7498C+Y+d3n1SMDqQz6Oi/drfequgb4KTBWRGZmP8fq0DBsI58XgYvjdz3dYjabcx9Q5Q29L/P+322txsyZMSdEJzpZOvnJl95QLHwG5ThVLlGRBYhtGhEHDX3T4GoMK2Ox11OCLkuL6bXF1uJ7rm1+bvq8rR98BJDzOE/nzJjjYVo3Uyo9jJtJHOw+IddgC/AnEXkncC/QGpcsAbFTC8cDt6vqUdjWlz0JMVsXVLre3E50/c4AuB/fwuI1vI6NxDMr0EjMsnMS5t2+SXWnO53vzY1BJ+jt/PsFuu8j+zJ3t7l65zN73JMm4V8FzkH5Peiy9vqh7Ub4nt14bf+tEoPAB0JbCOk1bW3Fz7e2tp7V8OrK6yac+WzY6tWtuFguVg/VutmSNcDZGvCsgRER6fGOSZsz0VM5e1buAM4BLgdaKJlFE8zH6c0i8gtspD6CQSbqIlJpj/Eh1LhdVtVMvBspWVIywcu2ca0ZuY6xYIL+a0p7lGcdnjcAF4QQ3pV93p26E69VVTXNfZaN/jub268mDeR2VstdR4+XeA4Ok3sHzJkxx8T6pmPZsXXI2jUNyY0rJb1XVS+B8AlFTwAZitiOaN2OEB/3JScuSAMNaRruDppeoKn8Y9W6oa8ydMd0i/A4C7ZfoAt2WFDV63RqxrL4rlG0GoHdseesSJ2NBjrDAiJpAB4FzhWR+Zijk5IL7KWqu4vId7EG+n+A4iCaV18E7abfBKs3k7AQqUuovFNYNchEfCIwJhd0DWx/9FDrexLrhgKrgO+p6gQROY3SKB1gxyRJfoI9Wzd0M+kkesa/nv8M2zJ2B0pOoVWPlxCFuwDshnn2t48C4iEtPU1z8I7QMwT48neYM2MO151yaTp8xMrl2wZuDTBDVU5F9D5RUVslno/A2kWyNlKRkKYvt7S0/eua19cff81hv7l69EstS6f8fULaPLVJ58yYowPDuOb0kqxSPBrfBXtQC5hZ8BCiiGWjof581YooAAEL9/pl4IOqukpt/2lbXGedy1thTk7/q6oFrLAGw2j9PmhvwLPVAJOwePgJcdRZ5ZeNOEKYpKrvw/Y/h1Kdfg7zHq+5VuRM4q+IyLnYXgCZ2GYt507ABdg+Akk360wrdl35ztR44EMxPa3RcyhYeZ8RzxtiJwZVfQXrzPSIQT1C3wiBm7k5oMhps2fo/a+84fptd37xvgRmIHxTVMci3RunhxBWpWn6w2JL28UHMnH+U689JYDM+uAsnyOvX67HluUMj0PQBNt17GJsq9CnqEHPvxMeA56KglqTE+aWLAnwR2CZiDQBb1bVIVnHF2u4z8HWsX8dW6dfl1aNaL0AeATz6J6cE5ZRqvp1EdlbVe8QkfVVzk6CjXQ/BOyNWQkEq6crsU5HG/1Ub3NltQg4XVX/ICIHUHK0VGAy1iH8DPC4dr4cUoG1wG3A20VkCLQL+zuAPwGXYEvhql33RgHHYf4kQ7C+XeY0eJ+quqD3CYJe1vQm3W/bV5Id2hqXLhzSejeatCgSpGsxjz0s1rZpmLPFthPnv7AEmfT0pBAKHvWyHomNjmBLcm4FTsjbLFX1jSJyHv0nTtlIeSY2J9lW67xkJvgYWGYJ8GUReU/+EMzT/V3YaOlbQLOa53w9BqFJsABDfwS+lve1EJEtgbNF5Owa5SXrUOXDqwq2bPEf2H3pt45V7vmaJyLnYB7wB+fyGYCjgW9jHerFHU0RxLSKmKA/A7yJLMKnpXcItg6+JterG0e8U2CViPyJTehEDR6TuwKXnSrcfZigCN0wds9bvqUubGS8aOFrqGwj3Yu9LYpqUki2bSwU/ve1xc+PHjYZ5bwu8hbz1KRNyUf1o1J/45JBwWvYaHw+kGZmtQHgTStl7/2FYvPCDwCfBr5DqXORjbgagcOxwDYzyC0xqjMyr+3LgL+z4T3KdwZrkZfsJPkImK8BvwFeon/rLtA+faOYVeMrmLUpm2fPfACOx56/LeN3HdX3LJ1LsNH6BlZTrWFlK3DADPH016nq3zYlvUExQn/77Om0XZmSNqjq4m1Jrno3hZDAr8ew9Yg1ybLxy5KRi7fRq9eMUM6+OLz15mO455iZ0nL+l5GQnqoJ0wQtIpJ5QXbaMAqSAGlDoXDk6GHh4+PHpd8LIWHKredx9G3C4m0WJXN3G5W0NY6geUpTOuXak3XoyNE6XBu4v/CCgvAuPZMDdRfc833zINfzvwrYFfgvEdmC0BA6AAwIHQAGhA4AA0IHgAGhA8CA0AFgQOgAMCB0ABgQOgAMCB0ABoQOAANCB4ABAMwc2UYyVloyAAAAAElFTkSuQmCC" alt="TekToro Logo" style="width: 70px; height: 70px; object-fit: contain;" />
              </div>
            </div>
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
              <div><strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</div>
              <div><strong>Service Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
              <div><strong>Payment Due:</strong> ${new Date(new Date(invoice.issueDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} (Net 30)</div>
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
              <th style="width: 8%">Job Code#</th>
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
              const extended = rate * (hrs + qty);
              
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
                  <td class="text-right">$${extended.toFixed(2)}</td>
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