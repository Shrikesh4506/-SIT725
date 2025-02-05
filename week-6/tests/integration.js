// tests/integration.js
const { expect } = require('chai');
const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../server');

describe('API Integration Tests', () => {
    let connection;
    let db;
    let server;

    before(async () => {
        connection = await MongoClient.connect('mongodb://localhost:27017');
        db = connection.db('feedback_test');
        global.db = db;
        server = app.listen(3001);
    });

    after(async () => {
        await connection.close();
        server.close();
    });

    beforeEach(async () => {
        await db.collection('feedback').deleteMany({});
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
                .send(testFeedback);

            expect(response.status).to.equal(200);
            expect(response.body.statusCode).to.equal(200);
            expect(response.body.message).to.equal('Feedback submitted successfully');

            const savedFeedback = await db.collection('feedback')
                .findOne({ email: testFeedback.email });
            expect(savedFeedback).to.not.be.null;
            expect(savedFeedback.name).to.equal(testFeedback.name);
        });

        it('should handle invalid feedback data', async () => {
            const invalidFeedback = {
                email: 'not-an-email',  // Invalid email format
                message: 'Test message'  // Missing name field
            };

            const response = await request(app)
                .post('/api/feedback')
                .send(invalidFeedback);

            expect(response.status).to.equal(500);
            expect(response.body.statusCode).to.equal(500);
            expect(response.body.message).to.include('required');
        });

        it('should handle invalid email format', async () => {
            const invalidEmail = {
                name: 'Test User',
                email: 'not-an-email',
                message: 'Test message'
            };

            const response = await request(app)
                .post('/api/feedback')
                .send(invalidEmail);

            expect(response.status).to.equal(500);
            expect(response.body.statusCode).to.equal(500);
            expect(response.body.message).to.include('Invalid email');
        });
    });
});