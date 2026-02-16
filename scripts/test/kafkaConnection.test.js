const { Kafka } = require('kafkajs');
require('dotenv').config();

describe('Kafka Connection', () => {

  let admin

  beforeAll(async () => {

    const kafka = new Kafka({
      clientId: process.env.TEST_KAFKA_CLIENT_ID,
      brokers: [process.env.TEST_KAFKA_BROKERS],
    });

     admin = kafka.admin();
    await admin.connect();

  })

  afterAll(async () => {
     if (admin) await admin.disconnect();
  });

 
  test('get all topics', async () => {
    const topics = await admin.listTopics();
    console.log(topics);
    expect(Array.isArray(topics)).toBe(true);
  }, 20000);
})
