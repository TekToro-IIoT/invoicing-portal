# TekToro Design System - Complete Styling Package

## 1. Core CSS Variables & Theme (index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Base theme colors */
  --background: 217 19% 18%; /* #1E293B - Dark navy background */
  --foreground: 210 40% 98%; /* #F8FAFC - Very light text */
  --muted: 217 19% 22%; /* #2D3748 */
  --muted-foreground: 210 20% 70%; /* #94A3B8 */
  --popover: 217 19% 15%; /* #1A202C */
  --popover-foreground: 210 40% 98%; /* #F8FAFC */
  --card: 217 19% 22%; /* #2D3748 - Card background */
  --card-foreground: 210 40% 98%; /* #F8FAFC - Card text */
  --border: 217 19% 30%; /* #4A5568 - Lighter borders */
  --input: 217 19% 25%; /* #374151 - Input background */
  --primary: 145 63% 49%; /* #22C55E - Green */
  --primary-foreground: 0 0% 100%; /* #FFFFFF */
  --secondary: 217 19% 25%; /* #374151 */
  --secondary-foreground: 210 40% 98%; /* #F8FAFC */
  --accent: 217 19% 25%; /* #374151 */
  --accent-foreground: 210 40% 98%; /* #F8FAFC */
  --destructive: 0 84% 60%; /* #EF4444 */
  --destructive-foreground: 0 0% 100%; /* #FFFFFF */
  --ring: 145 63% 49%; /* #22C55E */
  --radius: 0.5rem;
  
  /* TekToro brand colors */
  --tektoro-primary: 145 63% 49%; /* #22C55E - Green */
  --tektoro-dark: 217 19% 15%; /* #1A202C - Darker navy */
  --tektoro-bg: 217 19% 18%; /* #1E293B - Background */
  --tektoro-text: 210 40% 98%; /* #F8FAFC - Light text */
  --tektoro-orange: 25 95% 53%; /* #FF6B35 - Orange accent */
}

/* Global dark theme styling */
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Form elements */
input, textarea, select {
  background-color: hsl(var(--input));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

button {
  color: hsl(var(--foreground));
}

/* Card components */
.card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-color: hsl(var(--border));
}

/* Table styling */
table {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
}

th, td {
  border-color: hsl(var(--border));
}

/* Modal and popover styling */
.modal, .popover {
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  border-color: hsl(var(--border));
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply font-inter antialiased bg-background text-foreground;
  }
}

@layer utilities {
  .font-inter {
    font-family: 'Inter', sans-serif;
  }
  
  .tektoro-primary {
    color: hsl(var(--tektoro-primary));
  }
  
  .bg-tektoro-primary {
    background-color: hsl(var(--tektoro-primary));
  }
  
  .tektoro-dark {
    color: hsl(var(--tektoro-dark));
  }
  
  .bg-tektoro-dark {
    background-color: hsl(var(--tektoro-dark));
  }
  
  .bg-tektoro-bg {
    background-color: hsl(var(--tektoro-bg));
  }
  
  .tektoro-text {
    color: hsl(var(--tektoro-text));
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary));
}

/* Enhanced visual design utilities */
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

.card-enhanced {
  background: linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)) 50%, hsl(var(--muted) / 0.5));
  border: 1px solid hsl(var(--border));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.card-enhanced:hover {
  border-color: hsl(var(--primary) / 0.5);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-paid {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-pending {
  background: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.status-overdue {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
```

## 2. Tailwind Configuration (tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // TekToro brand colors
        tektoro: {
          primary: "hsl(var(--tektoro-primary))",
          dark: "hsl(var(--tektoro-dark))",
          bg: "hsl(var(--tektoro-bg))",
          text: "hsl(var(--tektoro-text))",
          orange: "hsl(var(--tektoro-orange))",
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.5)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.4)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

## 3. Common Component Classes

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-tektoro-primary hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg border border-gray-600 transition-colors;
}

/* Destructive Button */
.btn-destructive {
  @apply bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors;
}
```

### Cards
```css
/* Standard Card */
.card-standard {
  @apply bg-tektoro-dark border border-gray-600 rounded-lg p-6 shadow-sm;
}

/* Enhanced Card with Hover */
.card-hover {
  @apply bg-tektoro-dark border border-gray-600 rounded-lg p-6 shadow-sm hover:scale-105 transition-transform cursor-pointer;
}
```

### Tables
```css
/* Table Container */
.table-container {
  @apply bg-tektoro-dark border border-gray-600 rounded-lg overflow-hidden;
}

/* Table Header */
.table-header {
  @apply bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider;
}

/* Table Row */
.table-row {
  @apply hover:bg-gray-700 cursor-pointer transition-colors;
}

/* Table Cell */
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-white;
}
```

### Forms
```css
/* Input Field */
.input-field {
  @apply bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tektoro-primary focus:border-transparent;
}

/* Select Field */
.select-field {
  @apply bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tektoro-primary focus:border-transparent;
}

/* Textarea */
.textarea-field {
  @apply bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tektoro-primary focus:border-transparent resize-none;
}
```

### Status Indicators
```css
.status-draft {
  @apply bg-gray-600 text-gray-300 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-sent {
  @apply bg-blue-500/20 text-blue-400 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-paid {
  @apply bg-green-500/20 text-green-400 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-overdue {
  @apply bg-red-500/20 text-red-400 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}
```

## 4. Layout Components

### Main Layout
```jsx
// Page Layout Component
const PageLayout = ({ children, title, subtitle }) => (
  <div className="p-6 space-y-6 bg-tektoro-bg min-h-screen">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
    {children}
  </div>
);
```

### Sidebar Navigation
```jsx
// Sidebar Component
const Sidebar = ({ navItems, activeItem }) => (
  <div className="w-64 bg-tektoro-dark text-white fixed h-full z-10">
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-tektoro-primary">TekToro</h2>
        <p className="text-sm text-gray-400">Admin Suite</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
              activeItem === item.path
                ? 'bg-tektoro-primary text-white'
                : 'hover:bg-tektoro-primary/20 text-gray-300 hover:text-white'
            }`}
          >
            <i className={`${item.icon} w-5`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  </div>
);
```

## 5. Package Dependencies

```json
{
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "tailwindcss-animate": "^1.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## 6. Implementation Steps

1. **Install Dependencies**
   ```bash
   npm install tailwindcss tailwindcss-animate @tailwindcss/typography autoprefixer postcss
   ```

2. **Copy CSS Variables**
   - Add the complete CSS from section 1 to your main CSS file
   - Import Inter font and Font Awesome

3. **Update Tailwind Config**
   - Replace your tailwind.config with the configuration from section 2
   - Adjust content paths to match your project structure

4. **Add Component Classes**
   - Copy the component classes from section 3
   - Add to your global CSS or create separate component files

5. **Implement Layout Components**
   - Use the layout components from section 4 as starting points
   - Customize navigation items and structure for your app

## 7. Color Palette Reference

- **Primary Green**: `#22C55E` (used for buttons, links, accents)
- **Dark Navy**: `#1A202C` (sidebar, cards, components)  
- **Background**: `#1E293B` (main page background)
- **Borders**: `#4A5568` (component borders)
- **Text Primary**: `#F8FAFC` (main text color)
- **Text Secondary**: `#94A3B8` (secondary text, placeholders)

## 8. Usage Examples

```jsx
// Button usage
<button className="btn-primary">
  <i className="fas fa-plus mr-2"></i>
  Create New
</button>

// Card usage
<div className="card-standard">
  <h3 className="text-white font-semibold mb-4">Card Title</h3>
  <p className="text-gray-400">Card content goes here</p>
</div>

// Table usage
<div className="table-container">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="table-header">Name</th>
        <th className="table-header">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell">Item name</td>
        <td className="table-cell">
          <span className="status-paid">Paid</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

// Input usage
<input 
  type="text" 
  placeholder="Enter text" 
  className="input-field w-full"
/>
```

This styling package provides everything needed to implement the consistent TekToro dark theme design system in any React application on Replit.