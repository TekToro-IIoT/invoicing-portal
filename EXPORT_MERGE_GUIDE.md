# TekToro Invoice Application - Export & Merge Guide

## Overview
This guide explains how to export the TekToro invoice system and merge it into an existing application as a module or standalone feature.

## Export Options

### Option 1: Module Integration (Recommended)
Export as a self-contained module that can be plugged into any React application.

### Option 2: Component Library
Export individual components that can be integrated piece by piece.

### Option 3: Microservice Architecture
Export the backend as a separate service with API endpoints.

---

## Method 1: Complete Module Export

### 1. Create Export Package Structure
```
tektoro-invoice-module/
├── components/
│   ├── InvoiceTable.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceModal.tsx
│   └── index.ts
├── pages/
│   ├── InvoicesPage.tsx
│   ├── MasterInvoicesPage.tsx
│   └── index.ts
├── api/
│   ├── invoiceApi.ts
│   ├── clientApi.ts
│   └── index.ts
├── utils/
│   ├── pdfGenerator.ts
│   ├── calculations.ts
│   └── index.ts
├── schemas/
│   ├── invoice.ts
│   ├── client.ts
│   └── index.ts
├── styles/
│   ├── invoice.css
│   └── variables.css
├── hooks/
│   ├── useInvoices.ts
│   ├── useClients.ts
│   └── index.ts
└── index.ts (main export)
```

### 2. Main Module Export (index.ts)
```typescript
// Main module exports
export * from './components';
export * from './pages';
export * from './api';
export * from './utils';
export * from './schemas';
export * from './hooks';

// Main configuration
export const TekToroInvoiceConfig = {
  apiBasePath: '/api/invoices',
  theme: 'tektoro-dark',
  features: {
    masterInvoices: true,
    pdfGeneration: true,
    clientManagement: true,
    authentication: true
  }
};

// Main component wrapper
export const TekToroInvoiceModule = ({ 
  config = TekToroInvoiceConfig,
  onNavigate,
  user 
}) => {
  return (
    <div className="tektoro-invoice-module">
      {/* Module content */}
    </div>
  );
};
```

---

## Method 2: Integration Steps

### Step 1: Extract Core Files
Copy these files from the current application:

**Components:**
- `client/src/components/invoices/*`
- `client/src/components/ui/*` (if using shadcn/ui)

**API Layer:**
- `migration-api.ts` (already extracted)
- Server routes from `server/routes.ts`

**Database Schema:**
- `shared/schema.ts`
- Database migration files

**Utilities:**
- `migration-utils.ts` (PDF generation, calculations)

**Styling:**
- `tektoro-styles-package.md` (complete theme)
- Component-specific CSS

### Step 2: Prepare Target Application

**Install Dependencies:**
```bash
npm install @tanstack/react-query drizzle-orm @neondatabase/serverless
npm install jspdf html2canvas date-fns zod
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install tailwindcss tailwindcss-animate
```

**Add Database Tables:**
```sql
-- Add to your existing database
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  -- ... other fields from schema
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  -- ... other fields
);
```

### Step 3: Integration Approaches

#### A. Route-Based Integration
Add invoice routes to your existing router:

```tsx
// In your main App.tsx or router
import { InvoicesPage, MasterInvoicesPage } from './modules/tektoro-invoice';

function App() {
  return (
    <Router>
      {/* Your existing routes */}
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/master-invoices" component={MasterInvoicesPage} />
    </Router>
  );
}
```

#### B. Tab/Section Integration
Add as a section within existing admin panel:

```tsx
// In your admin dashboard
import { TekToroInvoiceModule } from './modules/tektoro-invoice';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="admin-dashboard">
      <nav>
        <button onClick={() => setActiveTab('invoices')}>
          Invoices
        </button>
      </nav>
      
      {activeTab === 'invoices' && (
        <TekToroInvoiceModule 
          config={{ apiBasePath: '/api/v1/invoices' }}
          user={currentUser}
        />
      )}
    </div>
  );
}
```

#### C. Modal/Popup Integration
Add as a modal within existing interface:

```tsx
// Popup integration
import { InvoiceModal } from './modules/tektoro-invoice';

function ExistingComponent() {
  const [showInvoices, setShowInvoices] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowInvoices(true)}>
        Manage Invoices
      </button>
      
      <InvoiceModal 
        isOpen={showInvoices}
        onClose={() => setShowInvoices(false)}
      />
    </>
  );
}
```

---

## Method 3: API Integration

### Backend Service Export
Extract the invoice API as a standalone service:

```typescript
// invoiceService.ts
export class InvoiceService {
  constructor(private db: Database, private config: Config) {}
  
  async createInvoice(data: InvoiceData) {
    // Implementation from server/routes.ts
  }
  
  async getInvoices(filters?: InvoiceFilters) {
    // Implementation
  }
  
  async generatePDF(invoiceId: number) {
    // PDF generation logic
  }
}

// Export for integration
export const createInvoiceService = (db: Database) => {
  return new InvoiceService(db, defaultConfig);
};
```

### API Endpoints Integration
Add routes to your existing Express app:

```typescript
// In your main server
import { invoiceRoutes } from './modules/tektoro-invoice/routes';

app.use('/api/invoices', invoiceRoutes);
```

---

## Method 4: Configuration & Customization

### Theme Integration
```css
/* Merge with your existing CSS variables */
:root {
  /* Your existing variables */
  
  /* TekToro invoice variables */
  --invoice-primary: #22C55E;
  --invoice-bg: #1E293B;
  --invoice-card: #2D3748;
  /* ... other variables from tektoro-styles-package.md */
}
```

### Feature Flags
```typescript
// Configure which features to enable
const invoiceConfig = {
  features: {
    masterInvoices: true,
    pdfGeneration: true,
    clientManagement: false, // Use existing client system
    userManagement: false,   // Use existing auth
  },
  integration: {
    clientSource: 'external', // Use your client data
    authProvider: 'custom',   // Use your auth system
    apiBasePath: '/api/v1',
  }
};
```

---

## Method 5: Step-by-Step Integration

### Phase 1: Basic Setup
1. Copy migration files to your project
2. Install required dependencies
3. Add database schema
4. Configure API routes

### Phase 2: Component Integration
1. Import invoice components
2. Add to your navigation/routing
3. Test basic functionality
4. Apply styling integration

### Phase 3: Data Integration
1. Map your existing client data
2. Configure user permissions
3. Set up PDF generation
4. Test complete workflow

### Phase 4: Customization
1. Adjust styling to match your app
2. Configure feature flags
3. Add custom business logic
4. Optimize performance

---

## Quick Integration Checklist

- [ ] Copy migration files to target project
- [ ] Install dependencies
- [ ] Add database tables
- [ ] Configure API routes
- [ ] Import components
- [ ] Add navigation/routing
- [ ] Apply styling
- [ ] Test invoice creation
- [ ] Test PDF generation
- [ ] Configure authentication
- [ ] Test master invoices
- [ ] Customize theme
- [ ] Deploy and test

---

## Troubleshooting

### Common Issues:
1. **Styling conflicts** - Use CSS modules or namespace classes
2. **API path mismatches** - Configure apiBasePath in config
3. **Authentication issues** - Map your user system to invoice auth
4. **Database schema conflicts** - Rename tables or use prefixes
5. **Dependency conflicts** - Check version compatibility

### Solutions:
- Use CSS-in-JS or styled-components for isolation
- Implement adapter pattern for data mapping
- Create middleware for authentication bridging
- Use database migrations for safe schema updates

This guide provides multiple approaches depending on your integration needs - from simple component copying to full module architecture.