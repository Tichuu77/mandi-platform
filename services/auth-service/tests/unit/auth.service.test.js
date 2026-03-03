const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authService = require('../../src/services/auth.service');
const User = require('../../src/models/user');

// Mock Redis
jest.mock('../../src/config/redis', () => ({
  setex: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
}));

// Mock Kafka publisher
jest.mock('../../src/events/publisher', () => ({
  publishUserRegistered: jest.fn(),
  publishUserLoggedIn: jest.fn(),
  publishUserLoggedOut: jest.fn(),
}));

const redis = require('../../src/config/redis');
const publisher = require('../../src/events/publisher');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('Auth Service', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test1234',
    phone: '9876543210',
    mandiName: 'Test Mandi',
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(validUserData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Registration successful');
      expect(result.userId).toBeDefined();

      const user = await User.findById(result.userId);
      expect(user).toBeDefined();
      expect(user.email).toBe(validUserData.email);
      expect(user.status).toBe('pending');
    });

    it('should hash password during registration', async () => {
      const result = await authService.register(validUserData);
      const user = await User.findById(result.userId);

      expect(user.password).not.toBe(validUserData.password);
    });

    it('should publish user registered event', async () => {
      await authService.register(validUserData);
      expect(publisher.publishUserRegistered).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictError if email already exists', async () => {
      await authService.register(validUserData);

      await expect(authService.register(validUserData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should set role to admin for first user', async () => {
      const result = await authService.register(validUserData);
      const user = await User.findById(result.userId);
      expect(user.role).toBe('admin');
    });
  });

  describe('login', () => {
    let registeredUser;

    beforeEach(async () => {
      // Create and activate user
      registeredUser = await User.create({
        ...validUserData,
        status: 'active',
      });
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login(
        validUserData.email,
        validUserData.password
      );

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(validUserData.email);
    });

    it('should store session in Redis', async () => {
      await authService.login(validUserData.email, validUserData.password);
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should update lastLogin timestamp', async () => {
      await authService.login(validUserData.email, validUserData.password);
      
      const user = await User.findOne({ email: validUserData.email });
      expect(user.lastLogin).toBeDefined();
      expect(user.lastLogin).toBeInstanceOf(Date);
    });

    it('should save refresh token to database', async () => {
      const result = await authService.login(
        validUserData.email,
        validUserData.password
      );
      
      const user = await User.findOne({ email: validUserData.email });
      expect(user.refreshToken).toBe(result.refreshToken);
    });

    it('should publish user logged in event', async () => {
      await authService.login(validUserData.email, validUserData.password);
      expect(publisher.publishUserLoggedIn).toHaveBeenCalledTimes(1);
    });

    it('should throw AuthenticationError with invalid email', async () => {
      await expect(
        authService.login('wrong@example.com', validUserData.password)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw AuthenticationError with invalid password', async () => {
      await expect(
        authService.login(validUserData.email, 'WrongPassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw AuthenticationError if user is not active', async () => {
      await User.findOneAndUpdate(
        { email: validUserData.email },
        { status: 'inactive' }
      );

      await expect(
        authService.login(validUserData.email, validUserData.password)
      ).rejects.toThrow('Account is not active');
    });

    it('should throw AuthenticationError if user is pending', async () => {
      await User.findOneAndUpdate(
        { email: validUserData.email },
        { status: 'pending' }
      );

      await expect(
        authService.login(validUserData.email, validUserData.password)
      ).rejects.toThrow('Account is not active');
    });
  });

  describe('verifyToken', () => {
    let user;
    let accessToken;

    beforeEach(async () => {
      user = await User.create({ ...validUserData, status: 'active' });
      const result = await authService.login(
        validUserData.email,
        validUserData.password
      );
      accessToken = result.accessToken;
    });

    it('should verify valid token', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ userId: user._id }));

      const result = await authService.verifyToken(accessToken);

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(validUserData.email);
    });

    it('should throw AuthenticationError if session not in Redis', async () => {
      redis.get.mockResolvedValue(null);

      await expect(authService.verifyToken(accessToken)).rejects.toThrow(
        'Session expired'
      );
    });

    it('should throw AuthenticationError for invalid token', async () => {
      await expect(authService.verifyToken('invalid.token')).rejects.toThrow();
    });

    it('should throw AuthenticationError if user is inactive', async () => {
      await User.findByIdAndUpdate(user._id, { status: 'inactive' });
      redis.get.mockResolvedValue(JSON.stringify({ userId: user._id }));

      await expect(authService.verifyToken(accessToken)).rejects.toThrow(
        'User not found or inactive'
      );
    });
  });

  describe('refreshToken', () => {
    let user;
    let refreshToken;

    beforeEach(async () => {
      user = await User.create({ ...validUserData, status: 'active' });
      const result = await authService.login(
        validUserData.email,
        validUserData.password
      );
      refreshToken = result.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should update refresh token in database', async () => {
      const result = await authService.refreshToken(refreshToken);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshToken).toBe(result.refreshToken);
    });

    it('should throw AuthenticationError for invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid.refresh.token')
      ).rejects.toThrow();
    });

    it('should throw AuthenticationError if refresh token does not match', async () => {
      await User.findByIdAndUpdate(user._id, { refreshToken: 'different-token' });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw AuthenticationError if user is inactive', async () => {
      await User.findByIdAndUpdate(user._id, { status: 'inactive' });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'User not found or inactive'
      );
    });
  });

  describe('logout', () => {
    let user;
    let accessToken;

    beforeEach(async () => {
      user = await User.create({ ...validUserData, status: 'active' });
      const result = await authService.login(
        validUserData.email,
        validUserData.password
      );
      accessToken = result.accessToken;
    });

    it('should logout successfully', async () => {
      const result = await authService.logout(user._id.toString(), accessToken);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Logged out successfully');
    });

    it('should remove session from Redis', async () => {
      await authService.logout(user._id.toString(), accessToken);
      expect(redis.del).toHaveBeenCalledWith(`session:${user._id}`);
    });

    it('should remove refresh token from database', async () => {
      await authService.logout(user._id.toString(), accessToken);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshToken).toBeNull();
    });

    it('should publish user logged out event', async () => {
      await authService.logout(user._id.toString(), accessToken);
      expect(publisher.publishUserLoggedOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({ ...validUserData, status: 'active' });
    });

    it('should change password successfully', async () => {
      const result = await authService.changePassword(
        user._id.toString(),
        validUserData.password,
        'NewPassword123'
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password changed successfully');
    });

    it('should hash new password', async () => {
      await authService.changePassword(
        user._id.toString(),
        validUserData.password,
        'NewPassword123'
      );

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).not.toBe('NewPassword123');
      
      const isMatch = await updatedUser.comparePassword('NewPassword123');
      expect(isMatch).toBe(true);
    });

    it('should invalidate all sessions', async () => {
      await authService.changePassword(
        user._id.toString(),
        validUserData.password,
        'NewPassword123'
      );

      expect(redis.del).toHaveBeenCalledWith(`session:${user._id}`);
    });

    it('should clear refresh token', async () => {
      await authService.changePassword(
        user._id.toString(),
        validUserData.password,
        'NewPassword123'
      );

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.refreshToken).toBeNull();
    });

    it('should throw AuthenticationError with wrong old password', async () => {
      await expect(
        authService.changePassword(
          user._id.toString(),
          'WrongPassword',
          'NewPassword123'
        )
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw ValidationError if user not found', async () => {
      await expect(
        authService.changePassword(
          new mongoose.Types.ObjectId().toString(),
          validUserData.password,
          'NewPassword123'
        )
      ).rejects.toThrow('User not found');
    });
  });
});