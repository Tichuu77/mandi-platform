const {
  emailSchema,
  phoneSchema,
  passwordSchema,
  objectIdSchema,
  paginationSchema
} = require('../validators/common');

describe('Schema Validation Tests', () => {

  // =========================
  // EMAIL
  // =========================
  describe('emailSchema', () => {
    test('should accept valid email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    test('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid-email'))
        .toThrow('Invalid email address');
    });
  });

  // =========================
  // PHONE
  // =========================
  describe('phoneSchema', () => {
    test('should accept valid 10 digit phone', () => {
      expect(phoneSchema.parse('9876543210')).toBe('9876543210');
    });

    test('should reject phone with letters', () => {
      expect(() => phoneSchema.parse('98765abcde'))
        .toThrow('Phone must be 10 digits');
    });

    test('should reject phone with less digits', () => {
      expect(() => phoneSchema.parse('12345'))
        .toThrow('Phone must be 10 digits');
    });
  });

  // =========================
  // PASSWORD
  // =========================
  describe('passwordSchema', () => {
    test('should accept valid password', () => {
      expect(passwordSchema.parse('Test1234')).toBe('Test1234');
    });

    test('should reject short password', () => {
      expect(() => passwordSchema.parse('Test1'))
        .toThrow('Password must be at least 8 characters');
    });

    test('should reject without uppercase', () => {
      expect(() => passwordSchema.parse('test1234'))
        .toThrow('Password must contain at least one uppercase letter');
    });

    test('should reject without lowercase', () => {
      expect(() => passwordSchema.parse('TEST1234'))
        .toThrow('Password must contain at least one lowercase letter');
    });

    test('should reject without number', () => {
      expect(() => passwordSchema.parse('TestTest'))
        .toThrow('Password must contain at least one number');
    });
  });

  // =========================
  // OBJECT ID
  // =========================
  describe('objectIdSchema', () => {
    test('should accept valid MongoDB ObjectId', () => {
      expect(objectIdSchema.parse('507f1f77bcf86cd799439011'))
        .toBe('507f1f77bcf86cd799439011');
    });

    test('should reject invalid ObjectId', () => {
      expect(() => objectIdSchema.parse('invalid-id'))
        .toThrow('Invalid ID format');
    });
  });

  // =========================
  // PAGINATION
  // =========================
  describe('paginationSchema', () => {
    test('should apply default values', () => {
      const result = paginationSchema.parse({});
      expect(result).toEqual({
        page: 1,
        limit: 10,
        order: 'desc'
      });
    });

    test('should accept valid pagination input', () => {
      const result = paginationSchema.parse({
        page: 2,
        limit: 20,
        sortBy: 'name',
        order: 'asc'
      });

      expect(result).toEqual({
        page: 2,
        limit: 20,
        sortBy: 'name',
        order: 'asc'
      });
    });

    test('should reject limit greater than 100', () => {
      expect(() =>
        paginationSchema.parse({ limit: 200 })
      ).toThrow();
    });

    test('should reject invalid order value', () => {
      expect(() =>
        paginationSchema.parse({ order: 'invalid' })
      ).toThrow();
    });
  });

});
