const { MongoClient } = require('mongodb');
require('dotenv').config();


describe('MongoDB Connection', () => {
    let client;

    beforeAll(async () => {
        const uri = process.env.TEST_MONGO_URI;
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000, 
        });
        await client.connect();
    })

    afterAll(async () => {
        await client.close();
    });

    test('get all databases', async () => {
        const databases = await client.db().admin().listDatabases();

        const dbNames = databases.databases.map(db => db.name);

        console.log(dbNames);

        expect(Array.isArray(databases.databases)).toBe(true);
        expect(databases.databases.length).toBeGreaterThan(0);
    }, 10000);
})