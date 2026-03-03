const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startGrpcServer } = require('../../src/grpc/auth.server');
const User = require('../../src/models/user');

// Mock Redis
jest.mock('../../src/config/redis', () => ({
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
  quit: jest.fn(),
}));

// Mock Kafka
jest.mock('../../src/events/publisher', () => ({
  publishUserRegistered: jest.fn(),
  publishUserLoggedIn: jest.fn(),
  publishUserLoggedOut: jest.fn(),
}));

const redis = require('../../src/config/redis');

let mongoServer;
let grpcServer;
let client;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Start gRPC server
  grpcServer = startGrpcServer();

  // Create gRPC client
  const PROTO_PATH = path.join(__dirname, '../../../../shared/proto/auth.proto');
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const authProto = grpc.loadPackageDefinition(packageDefinition).mandi.auth;

  client = new authProto.AuthService(
    '0.0.0.0:50051',
    grpc.credentials.createInsecure()
  );

  // Wait for server to bind
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  client.close();
  grpcServer.forceShutdown();
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('Auth Service gRPC Integration Tests', () => {

  const validUserData = {
    name: 'Integration Test User',
    email: 'integration@example.com',
    password: 'Test1234',
    phone: '9876543210',
    mandiName: 'Integration Test Mandi',
  };

  // ========================
  // REGISTER
  // ========================

  describe('Register', () => {

    it('should register a new user via gRPC', (done) => {
      client.Register(validUserData, (error, response) => {
        expect(error).toBeNull();
        expect(response.success).toBe(true);
        expect(response.userId).toBeDefined();
        done();
      });
    });

    it('should return error for duplicate email', (done) => {
      client.Register(validUserData, () => {
        client.Register(validUserData, (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('already exists');
          done();
        });
      });
    });

  });

  // ========================
  // LOGIN
  // ========================

  describe('Login', () => {

    let user;

    beforeEach(async () => {
      user = await User.create({
        ...validUserData,
        status: 'active',
      });
    });

    it('should login with valid credentials via gRPC', (done) => {

      // Always return valid session for test
      redis.get.mockResolvedValue(
        JSON.stringify({ userId: user._id.toString() })
      );

      client.Login(
        {
          email: validUserData.email,
          password: validUserData.password,
        },
        (error, response) => {
          expect(error).toBeNull();
          expect(response.success).toBe(true);
          expect(response.accessToken).toBeDefined();
          expect(response.refreshToken).toBeDefined();
          expect(response.user).toBeDefined();
          done();
        }
      );
    });

    it('should return error for invalid credentials', (done) => {
      client.Login(
        {
          email: validUserData.email,
          password: 'WrongPassword',
        },
        (error) => {
          expect(error).toBeDefined();
          done();
        }
      );
    });

  });

  // ========================
  // VERIFY TOKEN
  // ========================

  describe('VerifyToken', () => {

    let user;
    let accessToken;

    beforeEach(async () => {
      user = await User.create({
        ...validUserData,
        status: 'active',
      });

      // Login to get token
      await new Promise((resolve) => {
        client.Login(
          {
            email: validUserData.email,
            password: validUserData.password,
          },
          (error, response) => {
            accessToken = response.accessToken;

            // Mock valid redis session
            redis.get.mockResolvedValue(
              JSON.stringify({ userId: user._id.toString() })
            );

            resolve();
          }
        );
      });
    });

    it('should verify valid token via gRPC', (done) => {
      client.VerifyToken({ token: accessToken }, (error, response) => {
        expect(error).toBeNull();
        expect(response.valid).toBe(true);
        expect(response.user).toBeDefined();
        done();
      });
    });

    it('should return error for invalid token', (done) => {
      client.VerifyToken({ token: 'invalid.token' }, (error) => {
        expect(error).toBeDefined();
        done();
      });
    });

  });

  // ========================
  // COMPLETE FLOW
  // ========================

  describe('Complete Flow', () => {

    it('should complete register → login → verify → logout flow', async () => {

      let userId;
      let accessToken;

      // Step 1: Register
      await new Promise((resolve) => {
        client.Register(validUserData, (error, response) => {
          expect(error).toBeNull();
          userId = response.userId;
          resolve();
        });
      });

      // Activate user
      await User.findByIdAndUpdate(userId, { status: 'active' });

      // Step 2: Login
      await new Promise((resolve) => {
        client.Login(
          {
            email: validUserData.email,
            password: validUserData.password,
          },
          (error, response) => {
            expect(error).toBeNull();
            accessToken = response.accessToken;

            // Mock redis for verify
            redis.get.mockResolvedValue(
              JSON.stringify({ userId })
            );

            resolve();
          }
        );
      });

      // Step 3: Verify
      await new Promise((resolve) => {
        client.VerifyToken({ token: accessToken }, (error, response) => {
          expect(error).toBeNull();
          expect(response.valid).toBe(true);
          resolve();
        });
      });

      // Step 4: Logout
      await new Promise((resolve) => {
        client.Logout(
          { userId: userId, token: accessToken },
          (error, response) => {
            expect(error).toBeNull();
            expect(response.success).toBe(true);
            resolve();
          }
        );
      });

    });

  });

});