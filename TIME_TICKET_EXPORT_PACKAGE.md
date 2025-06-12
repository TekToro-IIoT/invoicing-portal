# Time Ticket Entry Form - Complete Export Package

This package contains a comprehensive time ticket entry system that can be implemented in another Replit project. The system includes a full-featured form for tracking contractor time entries with oil & gas industry-specific fields.

## Package Contents

### 1. Frontend Component (`time-ticket-form-export.tsx`)
- Complete time ticket entry form with professional TekToro styling
- Automatic total hours calculation
- Form validation and error handling
- Recent time tickets display
- Support for draft saving and submission

### 2. Backend Schema (`time-ticket-backend-export.ts`)
- PostgreSQL database schema with Drizzle ORM
- Complete API routes for CRUD operations
- Storage interface and implementation
- Migration SQL scripts

### 3. Key Features

#### Time Entry Fields
- **Date Management**: Time entry date, service date, due date
- **Client Information**: Client selection, project, area
- **Job Tracking**: Internal job numbers, client job codes, milestones
- **Time Tracking**: Regular hours, overtime hours, automatic totals
- **Service Details**: Service points, AFE numbers, well information
- **Descriptions**: Detailed service descriptions, equipment descriptions

#### Oil & Gas Industry Specific
- AFE (Authorization for Expenditure) number tracking
- Well name and number fields
- Service point locations
- Job code classifications
- Equipment purchasing descriptions

#### Status Management
- Draft mode for saving incomplete entries
- Submission workflow
- Status tracking (draft → submitted → approved → invoiced)

## Implementation Guide

### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers
npm install zod drizzle-orm drizzle-zod
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### Step 2: Database Setup
Add the time ticket table to your database schema:

```sql
CREATE TABLE time_tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  todays_date TIMESTAMP NOT NULL,
  service_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  submitted_by VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  milestone_achieved VARCHAR(255),
  internal_job_number VARCHAR(100),
  client_job_code VARCHAR(100),
  regular_time_hours DECIMAL(5,2) NOT NULL,
  overtime_hours DECIMAL(5,2) NOT NULL,
  total_hours DECIMAL(5,2) NOT NULL,
  service_point VARCHAR(255),
  afe_type VARCHAR(50) DEFAULT 'AFE',
  afe_number VARCHAR(100),
  well_name VARCHAR(255),
  well_number VARCHAR(100),
  detailed_service_description TEXT,
  equipment_description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Backend Integration
Copy the API routes from `time-ticket-backend-export.ts` to your server:

```typescript
// Example integration in your routes file
import { timeTickets, insertTimeTicketSchema } from './schemas';

app.get('/api/time-tickets', isAuthenticated, async (req, res) => {
  // Implementation provided in export file
});

app.post('/api/time-tickets', isAuthenticated, async (req, res) => {
  // Implementation provided in export file
});
```

### Step 4: Frontend Integration
1. Copy `time-ticket-form-export.tsx` to your components directory
2. Update import paths to match your project structure
3. Add route to your router configuration

```typescript
// In your router
<Route path="/time-tickets" component={TimeTicketForm} />
```

### Step 5: Styling
The component uses TekToro's dark theme. Add these CSS variables:

```css
:root {
  --tektoro-bg: #0f1419;
  --tektoro-dark: #1a1f2e;
  --tektoro-primary: #22c55e;
}
```

## Form Structure and Validation

### Required Fields
- Time Entry Date
- Service Date
- Client Selection
- Project Name
- Regular Time Hours
- Service Point
- Detailed Service Description

### Optional Fields
- Due Date (auto-calculated)
- Area selection
- Milestone achieved
- Job numbers and codes
- Overtime hours
- AFE information
- Well details
- Equipment descriptions

### Automatic Calculations
- Total hours = Regular hours + Overtime hours
- Real-time updates as user types
- Visual display of calculation breakdown

## API Endpoints

### Time Tickets
- `GET /api/time-tickets` - List user's time tickets
- `GET /api/time-tickets/:id` - Get specific time ticket
- `POST /api/time-tickets` - Create new time ticket
- `PUT /api/time-tickets/:id` - Update time ticket
- `DELETE /api/time-tickets/:id` - Delete time ticket
- `PATCH /api/time-tickets/:id/status` - Update status

### Status Flow
1. **Draft** - Saved but not submitted
2. **Submitted** - Ready for approval
3. **Approved** - Approved for billing
4. **Invoiced** - Included in invoice

## Features Included

### Form Functionality
- Automatic date population (current date, 30-day due date)
- Real-time hour calculations
- Form validation with error messages
- Reset form after successful submission
- Loading states for mutations

### User Experience
- Professional dark theme styling
- Responsive design for mobile/desktop
- Clear field labels and placeholders
- Industry-specific field organization
- Visual feedback for actions

### Data Management
- User-based data filtering for security
- Proper error handling and validation
- Toast notifications for user feedback
- Query invalidation for real-time updates

### Admin Features
- Admin can submit on behalf of team members
- Status management workflow
- Historical time ticket viewing
- Bulk operations support

## Integration Notes

### Authentication Requirements
- User authentication with `req.user.id`
- Protected routes using auth middleware
- User-based data filtering

### Database Considerations
- Indexes on user_id, status, service_date for performance
- Foreign key constraints if integrating with existing tables
- Consider archiving old records for performance

### Customization Options
- Field visibility based on user roles
- Custom validation rules
- Additional status types
- Integration with payroll systems
- PDF export functionality

This time ticket system provides a complete solution for tracking contractor hours with industry-specific features tailored for oil & gas operations. The form is production-ready and includes all necessary validation, error handling, and user experience features.