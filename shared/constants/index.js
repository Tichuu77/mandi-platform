// User Roles
const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  DATA_ENTRY: 'dataentry',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
};

// Permissions
const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Challan Management
  CHALLAN_CREATE: 'challan:create',
  CHALLAN_READ: 'challan:read',
  CHALLAN_UPDATE: 'challan:update',
  CHALLAN_DELETE: 'challan:delete',
  
  // Voucher Management
  VOUCHER_CREATE: 'voucher:create',
  VOUCHER_READ: 'voucher:read',
  VOUCHER_UPDATE: 'voucher:update',
  VOUCHER_DELETE: 'voucher:delete',
  
  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  
  // Master Data
  MASTER_CREATE: 'master:create',
  MASTER_UPDATE: 'master:update',
  MASTER_DELETE: 'master:delete',
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.CHALLAN_CREATE,
    PERMISSIONS.CHALLAN_READ,
    PERMISSIONS.CHALLAN_UPDATE,
    PERMISSIONS.VOUCHER_CREATE,
    PERMISSIONS.VOUCHER_READ,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  [ROLES.DATA_ENTRY]: [
    PERMISSIONS.CHALLAN_CREATE,
    PERMISSIONS.CHALLAN_READ,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VOUCHER_CREATE,
    PERMISSIONS.VOUCHER_READ,
    PERMISSIONS.VOUCHER_UPDATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.CHALLAN_READ,
    PERMISSIONS.VOUCHER_READ,
    PERMISSIONS.REPORT_VIEW,
  ],
};

// Status Types
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Challan Types
const CHALLAN_TYPES = {
  BUYER: 'buyer',
  GROWER: 'grower',
  BOTH: 'both',
};

// Voucher Types
const VOUCHER_TYPES = {
  PAYMENT: 'payment',
  RECEIPT: 'receipt',
  JOURNAL: 'journal',
  CONTRA: 'contra',
};

// Payment Modes
const PAYMENT_MODES = {
  CASH: 'cash',
  BANK: 'bank',
  UPI: 'upi',
  CHEQUE: 'cheque',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
};

// Account Types
const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Monthly',
    price: 2999,
    duration: 30,
    features: ['All features', '1 Mandi', 'Unlimited users', '5GB storage'],
  },
  YEARLY: {
    name: 'Yearly',
    price: 29999,
    duration: 365,
    features: ['All features', '1 Mandi', 'Unlimited users', '10GB storage', 'Priority support'],
  },
};

// Kafka Topics
const KAFKA_TOPICS = {
  // Auth Events
  AUTH_USER_REGISTERED: 'auth.user.registered',
  AUTH_USER_LOGGED_IN: 'auth.user.logged_in',
  AUTH_USER_LOGGED_OUT: 'auth.user.logged_out',
  
  // Tenant Events
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  TENANT_ACTIVATED: 'tenant.activated',
  
  // Transaction Events
  CHALLAN_CREATED: 'transaction.challan.created',
  CHALLAN_UPDATED: 'transaction.challan.updated',
  GOODS_ARRIVED: 'transaction.goods.arrived',
  VOUCHER_CREATED: 'transaction.voucher.created',
  
  // Notification Events
  NOTIFICATION_SEND: 'notification.send',
  
  // Audit Events
  AUDIT_LOG: 'audit.log',
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  STATUS,
  CHALLAN_TYPES,
  VOUCHER_TYPES,
  PAYMENT_MODES,
  PAYMENT_STATUS,
  ACCOUNT_TYPES,
  SUBSCRIPTION_PLANS,
  KAFKA_TOPICS,
};