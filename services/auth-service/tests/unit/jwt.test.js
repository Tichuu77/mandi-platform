const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../../src/utils/jwt');

describe('JWT Utilities', () => {
  const payload = {
    userId: '123456',
    email: 'test@example.com',
    role: 'admin',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should set expiration time', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should include payload data in refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with past expiration
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      expect(() => {
        verifyAccessToken(expiredToken);
      }).toThrow('Token expired');
    });

    it('should throw error for token with wrong secret', () => {
      const jwt = require('jsonwebtoken');
      const wrongToken = jwt.sign(payload, 'wrong-secret');

      expect(() => {
        verifyAccessToken(wrongToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid.refresh.token');
      }).toThrow();
    });

    it('should throw error for expired refresh token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1d' }
      );

      expect(() => {
        verifyRefreshToken(expiredToken);
      }).toThrow('Refresh token expired');
    });
  });
});