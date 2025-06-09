# TekToro Invoicing System - Complete Migration Guide

## 📁 Folder Structure for `/modules/invoicing/`

```
/modules/invoicing/
├── components/
│   ├── InvoiceTable.tsx          # Main invoice listing table
│   ├── InvoiceForm.tsx           # Create/edit invoice form
│   ├── InvoiceModal.tsx          # Invoice view modal
│   └── MasterInvoiceModal.tsx    # Master invoice summary
├── pages/
│   ├── InvoicesPage.tsx          # Main invoices management page
│   └── MasterInvoicesPage.tsx    # Monthly invoice aggregation
├── utils/
│   ├── pdfGenerator.ts           # Individual invoice PDF generation
│   ├── masterPdfGenerator.ts     # Master invoice PDF generation
│   ├── dateHelpers.ts           # Date formatting utilities
│   └── calculations.ts          # Invoice calculation helpers
├── api/
│   └── invoiceApi.ts            # All API interaction functions
├── schemas/
│   ├── invoiceSchemas.ts        # Zod validation schemas
│   └── dbSchemas.ts            # Database table definitions
└── types/
    └── invoiceTypes.ts         # TypeScript type definitions
```

## 🔧 Required Dependencies

Add to your `package.json`:

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

## 🎨 TekToro Design System Integration

### Color Variables (Add to your CSS):
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

### Key Tailwind Classes:
- `bg-tektoro-bg` - Main page background
- `bg-tektoro-dark` - Card/component backgrounds  
- `bg-tektoro-primary` - Primary green buttons
- `text-white` - Primary text color
- `text-gray-400` - Secondary text
- `border-gray-600` - Component borders
- `hover:bg-gray-700` - Hover states

## 🗄️ Database Tables Required

```sql
-- Core tables needed for invoicing system
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR DEFAULT 'user',
  regular_rate VARCHAR DEFAULT '100',
  overtime_rate VARCHAR DEFAULT '150',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  country VARCHAR DEFAULT 'USA',
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  tax_id VARCHAR,
  logo VARCHAR,
  user_id VARCHAR REFERENCES users(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United States',
  contact_person VARCHAR(255),
  company_id INTEGER REFERENCES companies(id),
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  issue_date DATE NOT NULL,
  service_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  equipment_purchased_description TEXT,
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) NOT NULL,
  job_code VARCHAR,
  service_point VARCHAR,
  afe_loe VARCHAR,
  afe_number VARCHAR,
  well_name VARCHAR,
  well_number VARCHAR,
  service TEXT,
  rate DECIMAL(10,2) NOT NULL,
  hrs DECIMAL(10,2) DEFAULT 0,
  qty DECIMAL(10,2) DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 API Endpoint Mapping

Replace these endpoints in the migration files:

```typescript
// Current endpoints → TekToro endpoints
'/api/invoices' → '/api/tektoro/invoices'
'/api/clients' → '/api/tektoro/clients'  
'/api/companies' → '/api/tektoro/companies'
'/api/master-invoices' → '/api/tektoro/master-invoices'
'/api/dashboard/stats' → '/api/tektoro/dashboard/stats'
```

## 🧩 Integration Steps

### 1. Copy Migration Files
- Extract all files from migration package
- Place in `/modules/invoicing/` following the folder structure
- Update import paths to match TekToro's structure

### 2. Update Component Imports
Replace shadcn/ui imports with TekToro's component library:

```typescript
// Replace these imports
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// With TekToro equivalents
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
```

### 3. Update Authentication Integration
Replace auth hooks with TekToro's system:

```typescript
// Replace
import { useAuth } from "@/hooks/useAuth";

// With TekToro auth
import { useAuth } from "@/hooks/useTektoroAuth";
```

### 4. Update Toast System
Replace toast notifications:

```typescript
// Replace
import { useToast } from "@/hooks/use-toast";

// With TekToro toast
import { useToast } from "@/hooks/useTektoroToast";
```

### 5. Update Query Client
Integrate with TekToro's React Query setup:

```typescript
// Replace
import { queryClient } from "@/lib/queryClient";

// With TekToro query client
import { queryClient } from "@/lib/tektoroQueryClient";
```

## 🎯 Key Features Included

### Core Invoice Management
- Complete CRUD operations for invoices
- Advanced filtering and search capabilities
- Status management (draft, sent, paid, overdue)
- US date formatting (MM/DD/YYYY)
- Professional PDF generation

### Master Invoice System
- Monthly invoice aggregation by client
- Bulk billing summaries
- Master invoice PDF generation
- Period-based reporting

### Advanced Features
- Item-level invoice management with:
  - Job codes and service points
  - AFE/LOE tracking
  - Well names and numbers
  - Detailed service descriptions
- Tax calculation and management
- Equipment purchase tracking
- Client and company management
- Responsive dark theme design

## 🔄 Data Migration

If migrating existing data:

1. Export current invoice data
2. Map fields to new schema structure
3. Import using TekToro's data import tools
4. Verify all relationships are maintained

## 🧪 Testing Checklist

- [ ] Invoice creation and editing
- [ ] PDF generation (individual and master)
- [ ] Status updates and filtering
- [ ] Client and company management
- [ ] Date formatting displays correctly
- [ ] Tax calculations are accurate
- [ ] Master invoice aggregation works
- [ ] Responsive design on all devices
- [ ] Dark theme consistency

## 🚀 Deployment Notes

1. Ensure all TekToro dependencies are installed
2. Update environment variables for API endpoints
3. Test authentication integration
4. Verify database permissions for new tables
5. Test PDF generation in production environment

## 📋 Post-Migration Tasks

1. Update navigation to include invoicing module
2. Set up proper access controls and permissions
3. Configure automated invoice numbering
4. Set up recurring invoice functionality (if needed)
5. Train users on new invoice management features

## 🎛️ Configuration Options

### Invoice Number Format
Default: `INV-TDS-YYYY-XXXXXX`
Can be customized in `utils/calculations.ts`

### Default Tax Rates
Configure default tax rates per client/region in company settings

### PDF Styling
Customize PDF templates in `utils/pdfGenerator.ts` and `utils/masterPdfGenerator.ts`

### Date Formats
All dates use US format (MM/DD/YYYY) as configured in `utils/dateHelpers.ts`

This migration package provides a complete, production-ready invoicing system that maintains all TekToro design standards and integrates seamlessly with your existing admin suite.