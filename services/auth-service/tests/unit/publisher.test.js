// tests/unit/publisher.test.js

jest.mock('../../src/config/kafka', () => ({
  producer: {
    send: jest.fn(),
  },
}));

const { producer } = require('../../src/config/kafka');
const { logger, constants } = require('mandi-shared');

const {
  publishEvent,
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
} = require('../../src/events/publisher'); // adjust path if needed

describe('Kafka Publisher Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===============================
  // publishEvent
  // ===============================
  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      producer.send.mockResolvedValueOnce(true);

      const topic = 'test.topic';
      const key = '123';
      const message = { name: 'Akash' };

      await publishEvent(topic, key, message);

      expect(producer.send).toHaveBeenCalledTimes(1);

      const callArg = producer.send.mock.calls[0][0];

      expect(callArg.topic).toBe(topic);
      expect(callArg.messages[0].key).toBe(key);
      expect(callArg.messages[0].value).toBe(JSON.stringify(message));
      expect(callArg.messages[0].timestamp).toBeDefined();

      expect(logger.info).toHaveBeenCalledWith(
        `Event published to ${topic}:`,
        { key }
      );
    });

    it('should log error and rethrow when producer.send fails', async () => {
      producer.send.mockRejectedValueOnce(new Error('Kafka failed'));

      await expect(
        publishEvent('test.topic', '123', { name: 'Akash' })
      ).rejects.toThrow('Kafka failed');

      expect(logger.error).toHaveBeenCalledWith(
        `Failed to publish event to test.topic:`,
        'Kafka failed'
      );
    });
  });

  // ===============================
  // publishUserRegistered
  // ===============================
  describe('publishUserRegistered', () => {
    it('should publish AUTH_USER_REGISTERED event', async () => {
      producer.send.mockResolvedValueOnce(true);

      const user = {
        id: 'u1',
        email: 'test@example.com',
        name: 'Akash',
        role: 'admin',
        tenantId: 'tenant-1',
      };

      await publishUserRegistered(user);

      const callArg = producer.send.mock.calls[0][0];

      expect(callArg.topic).toBe(
        constants.KAFKA_TOPICS.AUTH_USER_REGISTERED
      );

      const payload = JSON.parse(callArg.messages[0].value);

      expect(payload).toMatchObject({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      });

      expect(payload.timestamp).toBeDefined();
    });
  });

  // ===============================
  // publishUserLoggedIn
  // ===============================
  describe('publishUserLoggedIn', () => {
    it('should publish AUTH_USER_LOGGED_IN event', async () => {
      producer.send.mockResolvedValueOnce(true);

      const user = {
        id: 'u2',
        email: 'login@example.com',
      };

      await publishUserLoggedIn(user);

      const callArg = producer.send.mock.calls[0][0];

      expect(callArg.topic).toBe(
        constants.KAFKA_TOPICS.AUTH_USER_LOGGED_IN
      );

      const payload = JSON.parse(callArg.messages[0].value);

      expect(payload.userId).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload.timestamp).toBeDefined();
    });
  });

  // ===============================
  // publishUserLoggedOut
  // ===============================
  describe('publishUserLoggedOut', () => {
    it('should publish AUTH_USER_LOGGED_OUT event', async () => {
      producer.send.mockResolvedValueOnce(true);

      const userId = 'u3';

      await publishUserLoggedOut(userId);

      const callArg = producer.send.mock.calls[0][0];

      expect(callArg.topic).toBe(
        constants.KAFKA_TOPICS.AUTH_USER_LOGGED_OUT
      );

      const payload = JSON.parse(callArg.messages[0].value);

      expect(payload.userId).toBe(userId);
      expect(payload.timestamp).toBeDefined();
    });
  });
});