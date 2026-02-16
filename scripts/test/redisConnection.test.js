const redis = require('redis');
require('dotenv').config();

describe('Redis Connection Test', () => {
  let client;

  beforeAll(async () => {
    console.log('Connecting to Redis...',process.env.TEST_REDIS_HOST,process.env.TEST_REDIS_PORT,process.env.TEST_REDIS_PASSWORD);
    client = redis.createClient({
      socket: {
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,  
      },
      password: process.env.TEST_REDIS_PASSWORD,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await client.connect();
  });

  afterAll(async () => {
    if (client) {
      await client.disconnect();
    }
  });

  test(
    'should connect to Redis and perform set/get',
    async () => {
      await client.set('test-key', 'Hello Redis!');
      const value = await client.get('test-key');

      console.log('Test value:', value);

      expect(value).toBe('Hello Redis!');
    },
    10000  
  );
});
