# Complete TekToro Invoicing Export Package

This package contains everything needed to implement Dashboard, Invoices, and Master Invoices functionality in another Replit application.

## Package Files

### 1. Frontend Components
- `migration-components.tsx` - Core invoice components (table, forms, modals)
- `migration-pages.tsx` - Complete pages for Invoices and Master Invoices
- `migration-dashboard.tsx` - Dashboard component with stats and recent invoices

### 2. Backend Implementation
- `migration-server-routes.ts` - All API endpoints for invoicing functionality
- `migration-storage.ts` - Database interface and operations
- `migration-schemas.ts` - Database schemas and validation

### 3. Utilities & Helpers
- `migration-utils.ts` - PDF generation, formatting, calculations
- `migration-api.ts` - Frontend API client functions
- `migration-auth-hooks.ts` - Authentication hooks and utilities

## Quick Implementation Guide

### Step 1: Database Setup
Copy the schema definitions from `migration-schemas.ts` to your shared schema file:

```typescript
// Add these tables to your schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  clientId: integer("client_id").references(() => clients.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  jobCode: varchar("job_code", { length: 100 }),
  afeNumber: varchar("afe_number", { length: 100 }),
  wellName: varchar("well_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Step 2: Backend Integration
1. Copy `migration-storage.ts` to your server directory
2. Copy `migration-server-routes.ts` and integrate with your existing routes
3. Update import paths to match your project structure

```typescript
// In your main routes file
import { registerInvoicingRoutes } from './migration-server-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Your existing auth setup
  await setupAuth(app);
  
  // Add invoicing routes
  await registerInvoicingRoutes(app);
  
  // Your other routes...
}
```

### Step 3: Frontend Integration
1. Copy components from migration files to your components directory
2. Update import paths to match your project structure
3. Add routes to your router

```typescript
// In your App.tsx router
import Dashboard from './pages/Dashboard';
import InvoicesPage from './pages/Invoices';
import MasterInvoicesPage from './pages/MasterInvoices';

<Switch>
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/invoices" component={InvoicesPage} />
  <Route path="/master-invoices" component={MasterInvoicesPage} />
  {/* Your other routes */}
</Switch>
```

### Step 4: Required Dependencies
```bash
npm install @tanstack/react-query wouter react-hook-form @hookform/resolvers
npm install zod drizzle-orm drizzle-zod date-fns jspdf html2canvas
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-select
```

### Step 5: Styling (TekToro Theme)
Add these CSS variables to your `index.css`:

```css
:root {
  --tektoro-bg: #0f1419;
  --tektoro-dark: #1a1f2e;
  --tektoro-primary: #22c55e;
  --background: 210 11% 8%;
  --card: 210 11% 12%;
  --primary: 142 76% 45%;
  --secondary: 217 32% 15%;
  --muted: 217 32% 15%;
  --border: 217 32% 20%;
}
```

## Core Features Included

### Dashboard
- Invoice statistics (active, outstanding, paid, overdue)
- Client count display
- Recent invoices list with status indicators
- Quick navigation to invoice management
- Responsive cards with hover effects

### Invoice Management
- Create, edit, delete invoices
- Status management (draft, sent, paid, overdue)
- Line item management with quantity, rate, amount
- PDF generation and download
- Search and filtering capabilities
- Bulk actions and status updates

### Master Invoices
- Monthly invoice aggregation by client
- Year/month navigation
- Client-specific master invoice generation
- Total revenue calculations
- PDF export for master invoices

### PDF Features
- Professional invoice layouts
- Company branding integration
- Detailed line item breakdown
- Tax calculations and totals
- Master invoice summaries

## API Endpoints Provided

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Invoices
- `GET /api/invoices` - List user invoices
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/status` - Update status

### Master Invoices
- `GET /api/invoices/master/:year/:month` - Monthly aggregation
- `GET /api/invoices/master/:year/:month/client/:clientId` - Client-specific

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

## Authentication Requirements

The system expects your authentication to provide:
- `req.user.id` - Current user identifier
- Protected routes using your auth middleware
- User-based data filtering for security

## Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

## File Structure After Integration

```
src/
├── components/
│   ├── invoices/
│   │   ├── InvoiceTable.tsx
│   │   ├── InvoiceForm.tsx
│   │   └── InvoiceModal.tsx
│   └── ui/ (your existing UI components)
├── pages/
│   ├── Dashboard.tsx
│   ├── Invoices.tsx
│   └── MasterInvoices.tsx
├── lib/
│   ├── api.ts (invoice API functions)
│   ├── utils.ts (PDF generation, formatting)
│   └── auth.ts (auth utilities)
├── server/
│   ├── routes.ts (with invoicing routes)
│   ├── storage.ts (database operations)
│   └── db.ts (your database connection)
└── shared/
    └── schema.ts (with invoice schemas)
```

## Testing the Integration

1. Run database migrations to create tables
2. Start your application
3. Navigate to `/dashboard` to see statistics
4. Go to `/invoices` to manage invoices
5. Visit `/master-invoices` for monthly aggregations
6. Test PDF generation and downloads
7. Verify user-based data filtering works

## Customization Options

### Styling
- Update CSS variables for your brand colors
- Modify component layouts in the migration files
- Customize PDF templates in `migration-utils.ts`

### Business Logic
- Adjust invoice number generation patterns
- Modify status workflows
- Add custom fields to schemas
- Extend PDF content and formatting

### Features
- Add email integration for invoice sending
- Implement payment tracking
- Add recurring invoice functionality
- Extend reporting capabilities

This package provides a complete, production-ready invoicing system that can be seamlessly integrated into any Replit application with proper authentication and database setup.