# TekToro Invoice Integration - Replit to Replit

## Quick Integration for Replit Applications

Since both applications are on Replit, you can directly copy files and integrate the invoice system into your existing Replit app.

## Method 1: Direct File Copy (Recommended)

### Step 1: Copy Core Files
From this Replit, copy these files to your target Replit:

**Migration Files (Already Prepared):**
- `migration-components.tsx` → `/src/components/invoices/InvoiceComponents.tsx`
- `migration-pages.tsx` → `/src/pages/InvoicesPage.tsx`
- `migration-api.ts` → `/src/api/invoiceApi.ts`
- `migration-schemas.ts` → `/src/schemas/invoiceSchemas.ts`
- `migration-utils.ts` → `/src/utils/invoiceUtils.ts`

**Styling:**
- Copy content from `tektoro-styles-package.md` into your main CSS file
- Update `tailwind.config.ts` with TekToro theme colors

### Step 2: Update Your Package.json
Add these dependencies to your existing Replit app:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-button": "^1.0.0",
    "lucide-react": "^0.344.0"
  }
}
```

### Step 3: Database Setup
If your target app doesn't have PostgreSQL:
1. Go to Tools → Database in your Replit
2. Add PostgreSQL database
3. Copy database schema from `shared/schema.ts`

### Step 4: Add Routes to Your App
In your main router file, add:

```tsx
import { InvoicesPage, MasterInvoicesPage } from './pages/InvoicesPage';

// Add to your existing routes
<Route path="/invoices" component={InvoicesPage} />
<Route path="/master-invoices" component={MasterInvoicesPage} />
```

### Step 5: Add Navigation
Update your sidebar/navigation:

```tsx
// Add to your nav items
<NavItem href="/invoices" icon="FileText">
  Invoices
</NavItem>
<NavItem href="/master-invoices" icon="FileStack">
  Master Invoices
</NavItem>
```

## Method 2: API Integration Only

If you only want the backend functionality:

### Copy Server Files
- Copy invoice routes from `server/routes.ts`
- Copy database schema from `shared/schema.ts`
- Copy PDF utilities from `migration-utils.ts`

### Add to Your Express Server
```typescript
// In your main server file
import { invoiceRoutes } from './routes/invoices';

app.use('/api/invoices', invoiceRoutes);
```

## Method 3: Component Library Integration

For selective integration:

### Individual Components
Copy specific components you need:
- `InvoiceTable` - for displaying invoice lists
- `InvoiceForm` - for creating/editing invoices
- `InvoiceModal` - for invoice details
- PDF generation utilities

### Usage in Your App
```tsx
import { InvoiceTable, InvoiceForm } from './components/invoices';

function MyExistingPage() {
  return (
    <div>
      {/* Your existing content */}
      <InvoiceTable 
        invoices={invoices}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

## Quick Setup Checklist

- [ ] Copy migration files to your Replit
- [ ] Install dependencies via Replit package manager
- [ ] Add PostgreSQL database (if not already present)
- [ ] Copy database schema
- [ ] Add routes to your router
- [ ] Update navigation menu
- [ ] Copy TekToro styling
- [ ] Test invoice creation
- [ ] Test PDF generation

## File Mapping Guide

```
Source (This Replit) → Target (Your Replit)
├── migration-components.tsx → /src/components/invoices/
├── migration-pages.tsx → /src/pages/
├── migration-api.ts → /src/api/
├── migration-schemas.ts → /src/schemas/
├── migration-utils.ts → /src/utils/
├── shared/schema.ts → /src/database/schema.ts
└── server/routes.ts (invoice parts) → /src/api/routes/
```

## Styling Integration

### Quick Theme Copy
Add these CSS variables to your main CSS file:

```css
:root {
  --tektoro-primary: 145 63% 49%; /* #22C55E - Green */
  --tektoro-dark: 217 19% 15%; /* #1A202C - Dark navy */
  --tektoro-bg: 217 19% 18%; /* #1E293B - Background */
  --tektoro-text: 210 40% 98%; /* #F8FAFC - Light text */
}

.btn-tektoro {
  @apply bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg;
}

.card-tektoro {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}
```

## Authentication Integration

### Using Your Existing Auth
Update the API calls to use your authentication system:

```typescript
// In migration-api.ts, update the headers
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  return fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${yourAuthToken}`, // Use your auth
      ...options.headers,
    },
  });
};
```

## Testing Integration

1. **Start your Replit app** with the new files
2. **Navigate to `/invoices`** - should show invoice list
3. **Create test invoice** - verify form works
4. **Generate PDF** - test PDF download
5. **Check database** - verify data saves correctly

## Common Replit Integration Issues

**Issue: Import path errors**
- Solution: Update import paths to match your folder structure

**Issue: CSS conflicts**
- Solution: Use CSS modules or namespace TekToro classes

**Issue: Database connection**
- Solution: Ensure DATABASE_URL environment variable is set

**Issue: PDF generation fails**
- Solution: Check if html2canvas and jspdf are installed

The integration should be straightforward since both apps are on Replit - the file system, database, and package management are handled the same way.