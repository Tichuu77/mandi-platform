const { MongoClient } = require('mongodb');

const uri =  process.env.TEST_MONGO_URI;
const client = new MongoClient(uri);

const testConnection = async function () {
  try {
    await client.connect();
    console.log('✓ Successfully connected to MongoDB');
    
    // List databases
    const databases = await client.db().admin().listDatabases();
    console.log('Databases:', databases.databases.map(db => db.name));
    
    await client.close();
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
  }
}

testConnection();

module.exports = testConnection;