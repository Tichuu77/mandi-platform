const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId:  process.env.TEST_KAFKA_CLIENT_ID,
  brokers: [ process.env.TEST_KAFKA_BROKERS ],
});

const testConnection = async function () {
  try {
    const admin = kafka.admin();
    await admin.connect();
    console.log('✓ Successfully connected to Kafka');
    
    // List topics
    const topics = await admin.listTopics();
    console.log('Topics:', topics);
    
    await admin.disconnect();
  } catch (error) {
    console.error('✗ Kafka connection failed:', error.message);
  }
}

testConnection();

module.exports = testConnection;