const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const authService = require('../services/auth.service');
const { logger } = require('mandi-shared');
// Load proto file
const PROTO_PATH = path.join(__dirname, '../../../../shared/proto/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).mandi.auth;

/**
 * gRPC Service Handlers
 */
const handlers = {
  /**
   * Register handler
   */
  async Register(call, callback) {
    try {
      const result = await authService.register(call.request);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC Register error:', error.message);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },

  /**
   * Login handler
   */
  async Login(call, callback) {
    try {
      const { email, password } = call.request;
      const result = await authService.login(email, password);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC Login error:', error.message);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message,
      });
    }
  },

  /**
   * Verify token handler
   */
  async VerifyToken(call, callback) {
    try {
      const { token } = call.request;
      const result = await authService.verifyToken(token);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC VerifyToken error:', error.message);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message,
      });
    }
  },

  /**
   * Refresh token handler
   */
  async RefreshToken(call, callback) {
    try {
      const { refresh_token } = call.request;
      const result = await authService.refreshToken(refresh_token);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC RefreshToken error:', error.message);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message,
      });
    }
  },

  /**
   * Logout handler
   */
  async Logout(call, callback) {
    try {
      const { user_id, token } = call.request;
      const result = await authService.logout(user_id, token);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC Logout error:', error.message);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },

  /**
   * Change password handler
   */
  async ChangePassword(call, callback) {
    try {
      const { user_id, old_password, new_password } = call.request;
      const result = await authService.changePassword(user_id, old_password, new_password);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC ChangePassword error:', error.message);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },

    /**
   * Forgot password handler
   */
  async ForgotPassword(call, callback) {
    try {
      const { email } = call.request;
      const result = await authService.forgotPassword(email);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC ForgotPassword error:', error.message);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },

    /**
   * Reset password handler
   */
  async ResetPassword(call, callback) {
    try {
      const { email, reset_token, new_password } = call.request;
      const result = await authService.resetPassword(email, reset_token, new_password);
      callback(null, result);
    } catch (error) {
      logger.error('gRPC ResetPassword error:', error.message);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },
};

/**
 * Start gRPC server
 */
const startGrpcServer = () => {
  const server = new grpc.Server();
  
  server.addService(authProto.AuthService.service, handlers);
  
  const port = process.env.PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        logger.error('Failed to start gRPC server:', error.message);
        process.exit(1);
      }
      logger.info(`Auth gRPC server running on port ${boundPort}`);
      server.start();
    }
  );

  return server;
};

module.exports = { startGrpcServer };