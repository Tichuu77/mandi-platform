const { Kafka } = require('kafkajs');
const { logger } = require('mandi-shared');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS.split(','),
  retry: {
    retries: 5,
    initialRetryTime: 300,
  },
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected');
  } catch (error) {
    logger.error('Kafka producer connection failed:', error.message);
    throw error;
  }
};

const disconnectProducer = async () => {
  await producer.disconnect();
};

module.exports = {
  kafka,
  producer,
  connectProducer,
  disconnectProducer,
};