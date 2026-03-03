const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user');

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
});

describe('User Model', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test1234',
    phone: '9876543210',
    role: 'admin',
    mandiName: 'Test Mandi',
  };

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create(validUserData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.phone).toBe(validUserData.phone);
      expect(user.role).toBe(validUserData.role);
      expect(user.status).toBe('pending'); // Default status
    });

    it('should hash password before saving', async () => {
      const user = await User.create(validUserData);
      
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe(validUserData.password);
      expect(user.password.length).toBeGreaterThan(50); // Hashed password is longer
    });

    it('should convert email to lowercase', async () => {
      const userData = { ...validUserData, email: 'TEST@EXAMPLE.COM' };
      const user = await User.create(userData);
      
      expect(user.email).toBe('test@example.com');
    });

    it('should trim whitespace from fields', async () => {
      const userData = { ...validUserData, name: '  Test User  ' };
      const user = await User.create(userData);
      
      expect(user.name).toBe('Test User');
    });
  });

  describe('User Validation', () => {
    it('should fail without required fields', async () => {
      const user = new User({});
      let error;
      
      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.phone).toBeDefined();
    });

    it('should fail with invalid email format', async () => {
      const userData = { ...validUserData, email: 'invalid-email' };
      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should fail with invalid phone format', async () => {
      const userData = { ...validUserData, phone: '123' };
      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.phone).toBeDefined();
    });

    it('should fail with password less than 8 characters', async () => {
      const userData = { ...validUserData, password: 'Test123' };
      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should fail with invalid role', async () => {
      const userData = { ...validUserData, role: 'invalidrole' };
      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should prevent duplicate email', async () => {
      await User.create(validUserData);
      
      let error;
      try {
        await User.create(validUserData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('Password Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create(validUserData);
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('Test1234');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isMatch = await user.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
    });

    it('should re-hash password when changed', async () => {
      const oldPassword = user.password;
      
      user.password = 'NewPassword123';
      await user.save();

      expect(user.password).not.toBe(oldPassword);
      expect(user.password).not.toBe('NewPassword123');
      
      const isMatch = await user.comparePassword('NewPassword123');
      expect(isMatch).toBe(true);
    });

    it('should not re-hash password if not modified', async () => {
      const oldPassword = user.password;
      
      user.name = 'Updated Name';
      await user.save();
      expect(user.password).toBe(oldPassword);
    });
  });

  describe('toAuthJSON Method', () => {
    it('should return user without sensitive data', async () => {
      const user = await User.create(validUserData);
      const authJSON = user.toAuthJSON();

      expect(authJSON.id).toBeDefined();
      expect(authJSON.name).toBe(validUserData.name);
      expect(authJSON.email).toBe(validUserData.email);
      expect(authJSON.role).toBe(validUserData.role);
      expect(authJSON.password).toBeUndefined();
      expect(authJSON.refreshToken).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    it('should set default status to pending', async () => {
      const user = await User.create(validUserData);
      expect(user.status).toBe('pending');
    });

    it('should set default role to admin', async () => {
      const userData = { ...validUserData };
      delete userData.role;
      const user = await User.create(userData);
      expect(user.role).toBe('admin');
    });

    it('should set lastLogin to null by default', async () => {
      const user = await User.create(validUserData);
      expect(user.lastLogin).toBeNull();
    });

    it('should set refreshToken to null by default', async () => {
      const user = await User.create(validUserData);
      expect(user.refreshToken).toBeNull();
    });
  });

  describe('Timestamps', () => {
    it('should add createdAt timestamp', async () => {
      const user = await User.create(validUserData);
      expect(user.createdAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should add updatedAt timestamp', async () => {
      const user = await User.create(validUserData);
      expect(user.updatedAt).toBeDefined();
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when user is modified', async () => {
      const user = await User.create(validUserData);
      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      user.name = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});