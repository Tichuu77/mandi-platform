require('dotenv').config();

const testMongoConnection = require('./test-mongodb');
const testRedisConnection = require('./test-redis');
const testKafkaConnection = require('./test-kafka');

(async () => {
    try {
        await testMongoConnection();
        await testRedisConnection();
        await testKafkaConnection();
        console.log('✓ All connections successful');
        process.exit(0);
    } catch (error) {
        console.error('✗ Connection failed:', error.message);
        process.exit(1);
    }
})();
