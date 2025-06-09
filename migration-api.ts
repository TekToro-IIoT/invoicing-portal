// TekToro Invoicing API Functions Migration Package

// Base API configuration
const API_BASE_URL = '/api'; // Replace with TekToro's base URL

// Generic API request function
export async function apiRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Invoice API Functions
export const invoiceApi = {
  // Get all invoices
  getInvoices: () => apiRequest('/invoices'),

  // Get single invoice by ID
  getInvoice: (id: number) => apiRequest(`/invoices/${id}`),

  // Create new invoice
  createInvoice: (invoiceData: any) => apiRequest('/invoices', 'POST', invoiceData),

  // Update existing invoice
  updateInvoice: (id: number, invoiceData: any) => apiRequest(`/invoices/${id}`, 'PUT', invoiceData),

  // Delete invoice
  deleteInvoice: (id: number) => apiRequest(`/invoices/${id}`, 'DELETE'),

  // Update invoice status
  updateInvoiceStatus: (id: number, status: string) => 
    apiRequest(`/invoices/${id}/status`, 'PATCH', { status }),

  // Generate invoice number
  generateInvoiceNumber: () => apiRequest('/invoices/generate-number'),

  // Get invoices by date range
  getInvoicesByDateRange: (startDate: string, endDate: string) => 
    apiRequest(`/invoices?startDate=${startDate}&endDate=${endDate}`),

  // Get invoices by client
  getInvoicesByClient: (clientId: number) => apiRequest(`/invoices?clientId=${clientId}`),

  // Get invoices by status
  getInvoicesByStatus: (status: string) => apiRequest(`/invoices?status=${status}`),
};

// Client API Functions
export const clientApi = {
  // Get all clients
  getClients: () => apiRequest('/clients'),

  // Get single client by ID
  getClient: (id: number) => apiRequest(`/clients/${id}`),

  // Create new client
  createClient: (clientData: any) => apiRequest('/clients', 'POST', clientData),

  // Update existing client
  updateClient: (id: number, clientData: any) => apiRequest(`/clients/${id}`, 'PUT', clientData),

  // Delete client
  deleteClient: (id: number) => apiRequest(`/clients/${id}`, 'DELETE'),

  // Get clients by user
  getClientsByUser: (userId: string) => apiRequest(`/clients?userId=${userId}`),
};

// Company API Functions
export const companyApi = {
  // Get all companies
  getCompanies: () => apiRequest('/companies'),

  // Get single company by ID
  getCompany: (id: number) => apiRequest(`/companies/${id}`),

  // Get default company
  getDefaultCompany: () => apiRequest('/companies/default'),

  // Create new company
  createCompany: (companyData: any) => apiRequest('/companies', 'POST', companyData),

  // Update existing company
  updateCompany: (id: number, companyData: any) => apiRequest(`/companies/${id}`, 'PUT', companyData),

  // Delete company
  deleteCompany: (id: number) => apiRequest(`/companies/${id}`, 'DELETE'),

  // Set default company
  setDefaultCompany: (id: number) => apiRequest(`/companies/${id}/set-default`, 'PATCH'),
};

// Master Invoice API Functions
export const masterInvoiceApi = {
  // Get master invoice data by period
  getMasterInvoicesByPeriod: (year: number, month: number, clientId?: number) => {
    const params = new URLSearchParams({ year: year.toString(), month: month.toString() });
    if (clientId) params.append('clientId', clientId.toString());
    return apiRequest(`/master-invoices?${params.toString()}`);
  },

  // Get aggregated data for a specific client and period
  getClientMasterInvoice: (clientId: number, year: number, month: number) => 
    apiRequest(`/master-invoices/client/${clientId}?year=${year}&month=${month}`),

  // Generate master invoice PDF
  generateMasterInvoicePDF: (clientId: number, year: number, month: number) => 
    apiRequest(`/master-invoices/pdf?clientId=${clientId}&year=${year}&month=${month}`, 'POST'),
};

// Dashboard/Stats API Functions
export const dashboardApi = {
  // Get dashboard statistics
  getDashboardStats: () => apiRequest('/dashboard/stats'),

  // Get recent invoices
  getRecentInvoices: (limit: number = 5) => apiRequest(`/invoices/recent?limit=${limit}`),

  // Get revenue by period
  getRevenueByPeriod: (period: 'month' | 'quarter' | 'year' = 'month') => 
    apiRequest(`/dashboard/revenue?period=${period}`),

  // Get invoice status distribution
  getInvoiceStatusDistribution: () => apiRequest('/dashboard/invoice-status'),
};

// User API Functions (if needed for integration)
export const userApi = {
  // Get current user
  getCurrentUser: () => apiRequest('/auth/user'),

  // Get all users (admin only)
  getUsers: () => apiRequest('/users'),

  // Update user profile
  updateUserProfile: (userId: string, userData: any) => 
    apiRequest(`/users/${userId}`, 'PUT', userData),

  // Update user rates
  updateUserRates: (userId: string, regularRate: string, overtimeRate: string) => 
    apiRequest(`/users/${userId}/rates`, 'PATCH', { regularRate, overtimeRate }),

  // Update user role
  updateUserRole: (userId: string, role: string) => 
    apiRequest(`/users/${userId}/role`, 'PATCH', { role }),
};

// File Upload API Functions (for logos, attachments, etc.)
export const fileApi = {
  // Upload file
  uploadFile: async (file: File, type: 'logo' | 'attachment' = 'attachment') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete file
  deleteFile: (fileId: string) => apiRequest(`/files/${fileId}`, 'DELETE'),
};

// Export utility functions for React Query integration
export const queryKeys = {
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.invoices.details(), id] as const,
  },
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.clients.details(), id] as const,
  },
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    default: () => [...queryKeys.companies.all, 'default'] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.companies.details(), id] as const,
  },
  masterInvoices: {
    all: ['master-invoices'] as const,
    byPeriod: (year: number, month: number, clientId?: number) => 
      [...queryKeys.masterInvoices.all, 'period', year, month, clientId] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    revenue: (period: string) => [...queryKeys.dashboard.all, 'revenue', period] as const,
  },
};

// React Query mutation functions
export const mutations = {
  // Invoice mutations
  createInvoice: {
    mutationFn: invoiceApi.createInvoice,
    invalidateQueries: [queryKeys.invoices.all, queryKeys.dashboard.all],
  },
  updateInvoice: {
    mutationFn: ({ id, data }: { id: number; data: any }) => invoiceApi.updateInvoice(id, data),
    invalidateQueries: [queryKeys.invoices.all, queryKeys.dashboard.all],
  },
  deleteInvoice: {
    mutationFn: invoiceApi.deleteInvoice,
    invalidateQueries: [queryKeys.invoices.all, queryKeys.dashboard.all],
  },
  updateInvoiceStatus: {
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      invoiceApi.updateInvoiceStatus(id, status),
    invalidateQueries: [queryKeys.invoices.all, queryKeys.dashboard.all],
  },

  // Client mutations
  createClient: {
    mutationFn: clientApi.createClient,
    invalidateQueries: [queryKeys.clients.all],
  },
  updateClient: {
    mutationFn: ({ id, data }: { id: number; data: any }) => clientApi.updateClient(id, data),
    invalidateQueries: [queryKeys.clients.all, queryKeys.invoices.all],
  },
  deleteClient: {
    mutationFn: clientApi.deleteClient,
    invalidateQueries: [queryKeys.clients.all, queryKeys.invoices.all],
  },

  // Company mutations
  createCompany: {
    mutationFn: companyApi.createCompany,
    invalidateQueries: [queryKeys.companies.all],
  },
  updateCompany: {
    mutationFn: ({ id, data }: { id: number; data: any }) => companyApi.updateCompany(id, data),
    invalidateQueries: [queryKeys.companies.all, queryKeys.invoices.all],
  },
  deleteCompany: {
    mutationFn: companyApi.deleteCompany,
    invalidateQueries: [queryKeys.companies.all],
  },
  setDefaultCompany: {
    mutationFn: companyApi.setDefaultCompany,
    invalidateQueries: [queryKeys.companies.all],
  },
};

// Error handling utilities
export const handleApiError = (error: any, toast?: any) => {
  console.error('API Error:', error);
  
  if (toast) {
    const message = error.message || 'An unexpected error occurred';
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }
  
  // Check for authentication errors
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    // Handle auth error - redirect to login or refresh token
    window.location.href = '/login';
  }
  
  throw error;
};

// Request interceptor for authentication
export const setAuthToken = (token: string) => {
  // Store auth token for API requests
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Enhanced API request with auth
export async function authenticatedApiRequest(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', 
  data?: any
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}