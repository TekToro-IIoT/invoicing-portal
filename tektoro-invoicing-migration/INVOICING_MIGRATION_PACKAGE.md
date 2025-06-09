# TekToro Invoicing System - Migration Package

## Folder Structure for `/modules/invoicing/`

```
/modules/invoicing/
├── components/
│   ├── InvoiceTable.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceModal.tsx
│   └── MasterInvoiceModal.tsx
├── pages/
│   ├── InvoicesPage.tsx
│   └── MasterInvoicesPage.tsx
├── utils/
│   ├── pdfGenerator.ts
│   ├── masterPdfGenerator.ts
│   ├── printUtils.ts
│   └── dateHelpers.ts
├── schemas/
│   ├── invoiceSchemas.ts
│   └── dbSchemas.ts
├── api/
│   └── invoiceApi.ts
└── types/
    └── invoiceTypes.ts
```

## Required NPM Packages

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@hookform/resolvers": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "drizzle-zod": "^0.5.0",
    "date-fns": "^2.0.0",
    "html2canvas": "^1.0.0",
    "jspdf": "^2.0.0"
  }
}
```

## Database Schema Requirements

### Core Tables
- users
- clients
- companies
- invoices
- invoiceItems
- timeTickets (optional - for time tracking integration)

See `schemas/dbSchemas.ts` for complete schema definitions.

## Tailwind Classes & Design Tokens

### TekToro Color Palette
```css
:root {
  --tektoro-bg: #1a1f2e;
  --tektoro-dark: #2a2f3e;
  --tektoro-primary: #22c55e;
}

.dark {
  --background: 212 11% 15%;
  --foreground: 210 11% 98%;
  --card: 215 15% 20%;
  --card-foreground: 210 11% 98%;
  --primary: 142 76% 36%;
  --primary-foreground: 355 7% 97%;
}
```

### Common Classes Used
- `bg-tektoro-bg` - Main background
- `bg-tektoro-dark` - Card/component backgrounds
- `bg-tektoro-primary` - Primary green buttons
- `text-white` - Primary text
- `text-gray-400` - Secondary text
- `border-gray-600` - Borders
- `hover:bg-gray-700` - Hover states

## Integration Notes

1. **API Rewiring**: Update all `/api/` endpoints to point to TekToro's PostgreSQL API
2. **Authentication**: Replace auth hooks with TekToro's auth system
3. **Toast Notifications**: Use TekToro's toast system
4. **Query Client**: Integrate with TekToro's React Query setup
5. **Routing**: Adapt navigation to TekToro's routing system

## Key Features Included

- Complete invoice CRUD operations
- Invoice PDF generation with professional formatting
- Master invoice functionality (monthly aggregation)
- Advanced filtering and search
- Status management (draft, sent, paid, overdue)
- Item-level invoice management
- US date formatting (MM/DD/YYYY)
- Responsive dark theme design

## Critical Files to Review

1. `components/InvoiceForm.tsx` - Main form logic
2. `utils/pdfGenerator.ts` - PDF generation
3. `schemas/invoiceSchemas.ts` - Validation schemas
4. `api/invoiceApi.ts` - API interaction functions