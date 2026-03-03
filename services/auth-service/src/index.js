require('dotenv').config();
const connectDB = require('./config/database');
const redis = require('./config/redis');
const { connectProducer } = require('./config/kafka');
const { startGrpcServer } = require('./grpc/auth.server');
const { logger } = require('mandi-shared');

/**
 * Initialize service
 */
const init = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect Kafka producer
    await connectProducer();

    // Start gRPC server
    startGrpcServer();

    logger.info('Auth Service initialized successfully');

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to initialize Auth Service:', error.message);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');

  try {
    // Close Redis connection
    await redis.quit();
    logger.info('Redis connection closed');

    // Close Kafka producer
    const { disconnectProducer } = require('./config/kafka');
    await disconnectProducer();
    logger.info('Kafka producer disconnected');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Start the service
init();