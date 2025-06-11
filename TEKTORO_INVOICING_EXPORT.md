# TekToro Invoicing System Export Package

This package contains all the functional components for Dashboard, Invoices, and Master Invoices functionality that can be implemented into another Replit application.

## Package Contents

### 1. Core Components (`migration-components.tsx`)
- `InvoiceTable` - Complete invoice management table with actions
- `InvoiceForm` - Modal form for creating/editing invoices
- `InvoiceModal` - Invoice view/detail modal
- Full CRUD operations with proper state management

### 2. Page Components (`migration-pages.tsx`)
- `InvoicesPage` - Main invoices management page
- `MasterInvoicesPage` - Monthly invoice aggregation page
- Complete UI with filters, search, and actions

### 3. Database Schemas (`migration-schemas.ts`)
- Zod validation schemas for all data models
- TypeScript types for forms and API responses
- Complete database table definitions

### 4. API Functions (`migration-api.ts`)
- Complete API client with all endpoints
- Error handling and authentication
- Query keys for React Query integration
- File upload functionality

### 5. Utility Functions (`migration-utils.ts`)
- PDF generation for invoices and master invoices
- Date/currency formatting
- Invoice number generation
- Status management utilities

### 6. Dashboard Integration
- Dashboard stats API endpoints
- Recent invoice displays
- Summary cards and metrics

## Implementation Guide

### Step 1: Install Dependencies
```bash
# Core dependencies
npm install @tanstack/react-query wouter react-hook-form @hookform/resolvers
npm install zod drizzle-orm drizzle-zod date-fns
npm install jspdf html2canvas lucide-react

# UI Components (if using shadcn/ui)
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-label
npm install class-variance-authority clsx tailwind-merge
```

### Step 2: Database Setup
1. Copy the database schema from `migration-schemas.ts`
2. Run database migrations to create tables
3. Ensure user authentication is properly integrated

### Step 3: API Integration
1. Copy API functions from `migration-api.ts`
2. Update base URL and authentication headers
3. Integrate with your existing authentication system

### Step 4: Component Integration
1. Copy components from `migration-components.tsx`
2. Copy pages from `migration-pages.tsx`
3. Add routes to your router configuration
4. Integrate with your existing UI library

### Step 5: Styling Integration
Use the TekToro design system variables:
```css
:root {
  --background: 210 11% 98%;
  --card: 0 0% 100%;
  --primary: 142 76% 36%;
  --secondary: 210 40% 94%;
  --accent: 210 40% 94%;
  --muted: 210 40% 94%;
  --border: 214 32% 91%;
}

.dark {
  --background: 210 11% 8%;
  --card: 210 11% 12%;
  --primary: 142 76% 45%;
  --secondary: 217 32% 15%;
  --accent: 217 32% 15%;
  --muted: 217 32% 15%;
  --border: 217 32% 20%;
}
```

## Features Included

### Dashboard
- Invoice statistics and metrics
- Recent invoices display
- Quick action buttons
- Responsive design

### Invoices Management
- Create, edit, delete invoices
- Status management (draft, sent, paid, overdue)
- Search and filtering
- PDF generation and download
- Email functionality

### Master Invoices
- Monthly invoice aggregation by client
- Master PDF generation
- Year/month navigation
- Client-specific master invoices

### Authentication Integration
- User-based data filtering
- Protected routes
- Session management
- Role-based access control

## File Structure for Integration

```
src/
├── components/
│   ├── invoices/
│   │   ├── InvoiceTable.tsx
│   │   ├── InvoiceForm.tsx
│   │   └── InvoiceModal.tsx
│   └── ui/ (shadcn components)
├── pages/
│   ├── Dashboard.tsx
│   ├── Invoices.tsx
│   └── MasterInvoices.tsx
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── schemas.ts
└── types/
    └── index.ts
```

## Environment Variables Required

```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
```

## Authentication Requirements

The system expects a user object with:
- `id` - User identifier
- `role` - User role (for admin features)

## API Endpoints to Implement

### Invoices
- `GET /api/invoices` - List user invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/status` - Update status

### Master Invoices
- `GET /api/invoices/master/:year/:month` - Get master invoice data
- `GET /api/invoices/master/:year/:month/client/:clientId` - Client-specific master

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client

## Notes
- All components use TekToro dark navy theme with green accents
- PDF generation includes company branding and professional formatting
- Responsive design works on desktop and mobile
- Form validation uses Zod schemas
- Error handling with toast notifications
- Loading states and skeleton components included