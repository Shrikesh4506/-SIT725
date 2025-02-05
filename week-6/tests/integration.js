// tests/integration.js
const { expect } = require('chai');
const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../server');

describe('API Integration Tests', () => {
    let connection;
    let db;
    let server;

    before(async function() {
        this.timeout(5000); // Increase timeout for DB connection
        try {
            // Connect to test database
            connection = await MongoClient.connect('mongodb://localhost:27017');
            db = connection.db('feedback_test');
            global.db = db;
            
            // Start server on test port
            return new Promise((resolve) => {
                server = app.listen(3002, () => {
                    console.log('Test server started on port 3002');
                    resolve();
                });
            });
        } catch (err) {
            console.error('Test setup failed:', err);
            throw err;
        }
    });

    after(async function() {
        try {
            await connection?.close();
            await new Promise((resolve) => {
                server?.close(() => {
                    console.log('Test server closed');
                    resolve();
                });
            });
        } catch (err) {
            console.error('Cleanup failed:', err);
        }
    });

    beforeEach(async () => {
        // Clean database before each test
        if (db) {
            await db.collection('feedback').deleteMany({});
        }
    });

    describe('POST /api/feedback', () => {
        it('should save valid feedback successfully', async () => {
            const testFeedback = {
                name: 'Integration Test User',
                email: 'integration@test.com',
                message: 'Test message from integration'
            };

            const response = await request(app)
                .post('/api/feedback')
                .send(testFeedback)
                .expect(200);

            expect(response.body.statusCode).to.equal(200);
            expect(response.body.message).to.equal('Feedback submitted successfully');

            // Verify database entry
            const savedFeedback = await db.collection('feedback')
                .findOne({ email: testFeedback.email });
            expect(savedFeedback).to.not.be.null;
            expect(savedFeedback.name).to.equal(testFeedback.name);
            expect(savedFeedback.message).to.equal(testFeedback.message);
        });

        it('should handle invalid feedback data', async () => {
            const invalidFeedback = {
                email: 'not-an-email',
                message: 'Test message'
                // Missing name field
            };

            const response = await request(app)
                .post('/api/feedback')
                .send(invalidFeedback)
                .expect(500);

            expect(response.body.statusCode).to.equal(500);
        });

        it('should handle invalid email format', async () => {
            const invalidEmail = {
                name: 'Test User',
                email: 'not-an-email',
                message: 'Test message'
            };

            const response = await request(app)
                .post('/api/feedback')
                .send(invalidEmail)
                .expect(500);

            expect(response.body.statusCode).to.equal(500);
        });
    });
});