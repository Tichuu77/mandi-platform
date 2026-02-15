const redis = require('redis');

const client = redis.createClient({
  socket: {
    host:  process.env.TEST_REDIS_HOST,
    port: process.env.TEST_REDIS_POST
  },
  password: process.env.TEST_REDIS_PASSWORD
});

const testConnection = async function () {
  try {
    await client.connect();
    console.log('✓ Successfully connected to Redis');
    
    // Test set and get
    await client.set('test-key', 'Hello Redis!');
    const value = await client.get('test-key');
    console.log('Test value:', value);
    
    await client.disconnect();
  } catch (error) {
    console.error('✗ Redis connection failed:', error.message);
  }
}

testConnection();

module.exports = testConnection;