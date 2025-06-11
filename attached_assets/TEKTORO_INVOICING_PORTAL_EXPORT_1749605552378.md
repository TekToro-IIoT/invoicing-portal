# TekToro Invoicing Portal - Complete Export Package

This document contains the complete export of the TekToro Invoicing Portal functionality for integration with external invoice applications.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Frontend Components](#frontend-components)
3. [Backend API Routes](#backend-api-routes)
4. [Contractor Invoice System](#contractor-invoice-system)
5. [Payment Processing](#payment-processing)
6. [Invoice Types & Workflow](#invoice-types--workflow)
7. [Integration Guidelines](#integration-guidelines)

---

## Database Schema

### Core Invoice Tables

#### 1. Main Invoices Table
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  billing_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_amount INTEGER NOT NULL,
  formatted_invoice_id TEXT NOT NULL,
  afe_number TEXT,
  job_code TEXT,
  job_number TEXT,
  sent_by INTEGER,
  sent_at TIMESTAMP,
  approved_by INTEGER,
  approved_at TIMESTAMP,
  signed_by INTEGER,
  signed_at TIMESTAMP,
  signer_name TEXT,
  signer_email TEXT,
  signer_ip TEXT,
  signature_hash TEXT,
  signature_metadata JSON,
  internal_notes TEXT,
  dispute_reason TEXT,
  disputed_at TIMESTAMP,
  last_modified_by INTEGER,
  last_modified_at TIMESTAMP,
  jurisdiction TEXT DEFAULT 'Cayman Islands',
  pdf_url TEXT,
  locked BOOLEAN DEFAULT false
);
```

#### 2. Invoice Line Items Table
```sql
CREATE TABLE invoice_line_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  time_ticket_id INTEGER REFERENCES time_tickets(id),
  project_id INTEGER NOT NULL REFERENCES projects(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  work_date TIMESTAMP,
  line_item_type TEXT NOT NULL,
  afe_number TEXT,
  job_code TEXT,
  milestone_tag TEXT,
  edited_description TEXT
);
```

#### 3. Contractor Invoices Table
```sql
CREATE TABLE contractor_invoices (
  id SERIAL PRIMARY KEY,
  contractor_id INTEGER NOT NULL REFERENCES users(id),
  invoice_number TEXT NOT NULL UNIQUE,
  status contractor_invoice_status NOT NULL DEFAULT 'draft',
  type invoice_type NOT NULL DEFAULT 'manual',
  issue_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT '0',
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT '0',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT '0',
  currency TEXT NOT NULL DEFAULT 'USD',
  contractor_company_name TEXT,
  contractor_tax_id TEXT,
  contractor_address TEXT,
  project_id INTEGER REFERENCES projects(id),
  client_id INTEGER REFERENCES clients(id),
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  payment_requested_at TIMESTAMP,
  paid_at TIMESTAMP,
  notes TEXT,
  internal_notes TEXT,
  ai_processing_notes TEXT,
  original_invoice_file TEXT,
  is_internal_project BOOLEAN DEFAULT false,
  cayman_compliant BOOLEAN DEFAULT true,
  global_compliant BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 4. Contractor Invoice Items Table
```sql
CREATE TABLE contractor_invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES contractor_invoices(id),
  time_ticket_id INTEGER REFERENCES time_tickets(id),
  description TEXT NOT NULL,
  quantity TEXT NOT NULL,
  rate TEXT NOT NULL,
  amount TEXT NOT NULL,
  date_worked TIMESTAMP,
  hours_worked TEXT,
  project_id INTEGER REFERENCES projects(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 5. Contractor Company Settings Table
```sql
CREATE TABLE contractor_company_settings (
  id SERIAL PRIMARY KEY,
  contractor_id INTEGER NOT NULL REFERENCES users(id),
  company_name TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cayman Islands',
  phone TEXT,
  email TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  invoice_prefix TEXT DEFAULT 'INV-',
  next_invoice_number INTEGER DEFAULT 1,
  payment_terms INTEGER DEFAULT 30,
  default_rate NUMERIC(8, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 6. Invoice Audit Logs Table
```sql
CREATE TABLE invoice_audit_logs (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  details TEXT,
  user_id TEXT,
  previous_status TEXT,
  new_status TEXT,
  ip_address TEXT
);
```

### Invoice Status Enums
```sql
CREATE TYPE contractor_invoice_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'payment_requested',
  'paid'
);

CREATE TYPE invoice_type AS ENUM (
  'manual',
  'time_based',
  'ai_processed'
);
```

---

## Frontend Components

### Main Invoicing Page Component

The main invoicing interface supports multiple user roles (Admin, Client, Contractor) with role-based filtering and comprehensive invoice management.

**File:** `client/src/pages/invoicing.tsx`

Key Features:
- Role-based dashboard switching (Admin/Client/Contractor views)
- Real-time invoice statistics and metrics
- Advanced filtering by status, contractor, and project
- Invoice status management with visual indicators
- Responsive design with dark theme support

**Component Structure:**
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  contractorId: string;
  projectId: number;
  clientName: string;
  projectName: string;
  amount: number;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  issueDate: string;
  currency: string;
}

interface InvoiceResponse {
  role: 'admin' | 'client' | 'contractor';
  invoicesByContractor?: Record<string, Invoice[]>;
  invoices?: Invoice[];
  totalInvoices: number;
  filtered?: boolean;
  filterType?: string;
}
```

**Key Functions:**
- Invoice status color coding and icons
- Advanced search and filtering
- Statistics calculation and display
- Role-based data fetching
- Responsive layout management

---

## Backend API Routes

### Core Invoice API Endpoints

#### 1. Get Contractor Invoices
```typescript
GET /api/contractor-invoices
```
- Fetches invoices based on user role
- Contractors see only their invoices
- Admins see all invoices
- Includes project and contractor name joins

#### 2. Get Approved Time Tickets
```typescript
GET /api/time-tickets/approved
```
- Returns approved time tickets for invoice creation
- Filtered by user ID for contractors
- Includes project information

#### 3. Contractor Settings Management
```typescript
GET /api/contractor-settings
POST /api/contractor-settings
```
- Manages contractor company information
- Handles invoice numbering and branding
- Supports payment details and preferences

#### 4. Create Invoice from Time Tickets
```typescript
POST /api/contractor-invoices/from-time-tickets
```
- Automatically generates invoices from approved time tickets
- Calculates totals and creates line items
- Updates invoice numbering sequence

#### 5. Manual Invoice Creation
```typescript
POST /api/contractor-invoices
```
- Creates manual invoices with custom line items
- Supports flexible billing scenarios
- Maintains audit trail

#### 6. AI Invoice Processing
```typescript
POST /api/contractor-invoices/ai-process
```
- Processes uploaded invoice documents using OpenAI
- Extracts structured data from PDFs/images
- Creates invoices with AI-extracted information

#### 7. Invoice Workflow Management
```typescript
POST /api/contractor-invoices/:invoiceId/submit
POST /api/contractor-invoices/:invoiceId/approve
POST /api/contractor-invoices/:invoiceId/reject
```
- Manages invoice approval workflow
- Sends notifications at each stage
- Maintains status history

---

## Contractor Invoice System

### Enhanced Features

**File:** `server/contractor-invoicing.ts`

#### AI-Powered Invoice Processing
- OpenAI integration for document extraction
- Supports PDF, PNG, JPG, JPEG formats
- Structured data extraction with JSON response format
- Automatic invoice number generation

#### Multi-Modal Invoice Creation
1. **Time-Based Invoices:** Generated from approved time tickets
2. **Manual Invoices:** Custom line items and descriptions
3. **AI-Processed Invoices:** Document upload with AI extraction

#### Compliance Features
- Cayman Islands jurisdiction compliance
- Global tax compliance flags
- Audit trail maintenance
- Digital signature support

#### Notification System
- Real-time status updates
- Email notifications for workflow changes
- Admin alerts for submissions and approvals

---

## Payment Processing

### Payment Methods Supported

**File:** `server/routes/invoicePaymentRoutes.ts`

#### 1. Stripe Integration
```typescript
POST /api/invoices/:id/pay/stripe
```
- Credit card payments via Stripe
- Payment intent creation
- Webhook handling for confirmations

#### 2. Bank Transfer
```typescript
POST /api/invoices/:id/pay/bank
```
- Traditional bank transfer processing
- Manual verification workflow
- Admin notification system

#### 3. Cryptocurrency Support
```typescript
POST /api/invoices/:id/pay/crypto
```
- Digital currency payment processing
- Multi-currency support
- Blockchain verification

#### 4. Manual Payment Proof
```typescript
POST /api/invoices/:id/pay/manual
```
- File upload for payment proofs
- Document verification workflow
- Audit trail maintenance

### Payment Workflow
1. **Payment Initiation:** Client selects payment method
2. **Status Update:** Invoice marked as "pending_payment"
3. **Verification:** Admin or automatic verification
4. **Completion:** Invoice marked as "paid"
5. **Notifications:** All parties notified of payment

---

## Invoice Types & Workflow

### Invoice Lifecycle

#### 1. Draft Stage
- Invoice creation and editing
- Line item management
- Contractor company settings application

#### 2. Submission Stage
- Invoice validation
- Automatic compliance checks
- Notification to reviewers

#### 3. Review Stage
- Admin review and approval
- Rejection with feedback
- Revision cycles

#### 4. Payment Stage
- Multiple payment method support
- Payment verification
- Final completion

### Status Management
- **Draft:** Initial creation state
- **Submitted:** Under review
- **Under Review:** Active review process
- **Approved:** Ready for payment
- **Rejected:** Requires revision
- **Payment Requested:** Payment initiated
- **Paid:** Complete

---

## Integration Guidelines

### For External Invoice Applications

#### 1. Database Integration
- Import the provided database schema
- Ensure foreign key relationships are maintained
- Consider data migration for existing invoices

#### 2. API Integration
- Use the provided REST endpoints
- Implement authentication middleware
- Handle role-based permissions

#### 3. Frontend Integration
- Adapt the React components to your UI framework
- Maintain responsive design principles
- Implement role-based view switching

#### 4. Payment Integration
- Configure Stripe with your API keys
- Set up webhook endpoints for payment confirmations
- Implement your preferred payment gateways

#### 5. AI Integration
- Configure OpenAI API for document processing
- Implement file upload handling
- Set up document storage and management

### Configuration Requirements

#### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SENDGRID_API_KEY=your_sendgrid_api_key
DATABASE_URL=your_database_connection_string
```

#### Dependencies
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "drizzle-orm": "^0.28.0",
    "stripe": "^13.0.0",
    "openai": "^4.0.0",
    "@sendgrid/mail": "^7.7.0",
    "multer": "^1.4.5",
    "puppeteer": "^21.0.0"
  }
}
```

### Security Considerations

#### 1. Authentication
- Implement JWT-based authentication
- Role-based access control
- Session management

#### 2. Data Protection
- Invoice data encryption
- Secure file uploads
- Payment information protection

#### 3. Audit Logging
- Complete action history
- User activity tracking
- Compliance reporting

### Testing Guidelines

#### 1. Unit Tests
- API endpoint testing
- Component functionality testing
- Database operation validation

#### 2. Integration Tests
- End-to-end invoice workflows
- Payment processing validation
- AI document processing testing

#### 3. Security Tests
- Authentication and authorization
- Input validation and sanitization
- File upload security

---

## Additional Features

### Advanced Functionality

#### 1. Bulk Operations
- Mass invoice creation
- Bulk status updates
- Batch payment processing

#### 2. Reporting & Analytics
- Invoice performance metrics
- Payment trend analysis
- Contractor performance tracking

#### 3. Document Management
- PDF generation and storage
- Digital signature integration
- Version control for invoices

#### 4. Notification System
- Real-time status updates
- Email and SMS notifications
- Slack/Teams integration

### Compliance & Legal

#### 1. Jurisdictional Support
- Cayman Islands compliance
- International tax regulations
- Multi-currency support

#### 2. Audit Requirements
- Complete transaction history
- Regulatory reporting
- Compliance documentation

This export package provides a complete, production-ready invoicing system with advanced features including AI processing, multiple payment methods, comprehensive workflow management, and full audit capabilities. The system is designed for scalability and can be easily integrated into existing applications or deployed as a standalone solution.