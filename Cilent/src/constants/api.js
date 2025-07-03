// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile'
    },
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: '/users',
      DELETE: '/users',
      GET_BY_ID: '/users'
    },
    AGENTS: {
      LIST: '/agents',
      CREATE: '/agents',
      UPDATE: '/agents',
      DELETE: '/agents',
      GET_BY_ID: '/agents',
      TRANSACTIONS: '/agents/transactions',
      SUMMARY: '/agents/summary'
    },
    PRODUCTS: {
      LIST: '/products',
      CREATE: '/products',
      UPDATE: '/products',
      DELETE: '/products',
      GET_BY_ID: '/products'
    },
    RECEIPTS: {
      IMPORT: '/receipts/import',
      EXPORT: '/receipts/export',
      LIST: '/receipts',
      CREATE: '/receipts',
      UPDATE: '/receipts',
      DELETE: '/receipts',
      GET_BY_ID: '/receipts'
    },
    IMPORT_RECEIPTS: {
      BASE: '/import-receipts',
      GET_BY_ID: '/import-receipts',
      GET_BY_DATE: '/import-receipts/by-date',
      CREATE: '/import-receipts',
      UPDATE: '/import-receipts',
      UPDATE_QUANTITY: '/import-receipts/quantity',
      DELETE: '/import-receipts'
    },
    IMPORT_DETAILS: {
      BASE: '/import-details',
      GET_BY_RECEIPT: '/import-details/by-receipt',
      GET_BY_PRODUCT: '/import-details/by-product', 
      SEARCH: '/import-details/search',
      CREATE: '/import-details',
      UPDATE: '/import-details',
      DELETE: '/import-details'
    },
    REPORTS: {
      DEBT: '/reports/debt',
      SALES: '/reports/sales',
      CREATE: '/reports',
      LIST: '/reports',
      GET_BY_ID: '/reports'
    },
    PAYMENT_RECEIPTS: {
      BASE: '/payment-receipts',
      LIST: '/payment-receipts',
      CREATE: '/payment-receipts',
      GET_BY_ID: '/payment-receipts',
      GET_BY_AGENT: '/payment-receipts/by-agent'
    },
    EXPORT_RECEIPTS: {
      BASE: '/export-receipts',
      GET_BY_ID: '/export-receipts',
      GET_BY_AGENT: '/export-receipts/by-agent',
      CREATE: '/export-receipts',
      UPDATE: '/export-receipts',
      DELETE: '/export-receipts',
      MULTIPLE: '/export-receipts/multiple'
    }
  }
};

// Test Users
export const TEST_USERS = {
  ADMIN: {
    email: 'vosithongtri@gmail.com',
    password: '123456',
    role: 'ADMIN'
  },
  WAREHOUSE: {
    email: 'phamtranquoc@gmail.com',
    password: '123456',
    role: 'WAREHOUSE'
  },
  DEBT: {
    email: 'nguyenminhduc@gmail.com',
    password: '123456',
    role: 'DEBT'
  },
  VIEWER: {
    email: 'hongocquynh@gmail.com',
    password: '123456',
    role: 'VIEWER'
  }
};

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: 'agency_management_secret_key',
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d'
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Agent Management System',
  VERSION: '1.0.0',
  DEV_MODE: true,
  DEBUG: true
}; 