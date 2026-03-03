// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// Global test timeout
jest.setTimeout(10000);

// Mock logger to suppress logs during tests
jest.mock('mandi-shared', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  errors: {
    AppError: class AppError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
      }
    },
    ValidationError: class ValidationError extends Error {
      constructor(message) {
        super(message);
        this.statusCode = 400;
      }
    },
    AuthenticationError: class AuthenticationError extends Error {
      constructor(message) {
        super(message);
        this.statusCode = 401;
      }
    },
    ConflictError: class ConflictError extends Error {
      constructor(message) {
        super(message);
        this.statusCode = 409;
      }
    },
  },
  helpers: {
    generateUniqueId: () => 'test-id-123',
    isValidEmail: (email) => /^\S+@\S+\.\S+$/.test(email),
    isValidPhone: (phone) => /^[0-9]{10}$/.test(phone),
  },
  constants: {
    KAFKA_TOPICS: {
      AUTH_USER_REGISTERED: 'auth.user.registered',
      AUTH_USER_LOGGED_IN: 'auth.user.logged_in',
      AUTH_USER_LOGGED_OUT: 'auth.user.logged_out',
    },
  },
}));

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});