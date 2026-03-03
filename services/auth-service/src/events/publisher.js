const { producer } = require('../config/kafka');
const { logger } = require('mandi-shared');
const { constants } = require('mandi-shared');

/**
 * Publish event to Kafka
 */
const publishEvent = async (topic, key, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
    logger.info(`Event published to ${topic}:`, { key });
  } catch (error) {
    logger.error(`Failed to publish event to ${topic}:`, error.message);
    throw error;
  }
};

/**
 * Publish user registered event
 */
const publishUserRegistered = async (user) => {
  await publishEvent(
    constants.KAFKA_TOPICS.AUTH_USER_REGISTERED,
    user.id,
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
    }
  );
};

/**
 * Publish user logged in event
 */
const publishUserLoggedIn = async (user) => {
  await publishEvent(
    constants.KAFKA_TOPICS.AUTH_USER_LOGGED_IN,
    user.id,
    {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    }
  );
};

/**
 * Publish user logged out event
 */
const publishUserLoggedOut = async (userId) => {
  await publishEvent(
    constants.KAFKA_TOPICS.AUTH_USER_LOGGED_OUT,
    userId,
    {
      userId,
      timestamp: new Date().toISOString(),
    }
  );
};

module.exports = {
  publishEvent,
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
};