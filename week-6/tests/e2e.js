// tests/e2e.js
const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const request = require('supertest');
const app = require('../server');

describe('End-to-End Tests', () => {
    let dom;
    let document;
    let server;
    
    before((done) => {
        // Load HTML and setup JSDOM
        const html = require('fs').readFileSync('public/index.html', 'utf8');
        dom = new JSDOM(html, {
            url: 'http://localhost',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        document = dom.window.document;
        
        // Start test server
        server = app.listen(3002, done);
    });

    after((done) => {
        server.close(done);
    });

    describe('Feedback Form', () => {
        it('should have all required form elements', () => {
            const form = document.getElementById('feedbackForm');
            expect(form).to.exist;

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('feedback');
            const submitButton = form.querySelector('button[type="submit"]');

            expect(nameInput).to.exist;
            expect(emailInput).to.exist;
            expect(messageInput).to.exist;
            expect(submitButton).to.exist;

            // Verify required attributes
            expect(nameInput.required).to.be.true;
            expect(emailInput.required).to.be.true;
            expect(messageInput.required).to.be.true;
        });

        it('should submit feedback through the API', async () => {
            const testFeedback = {
                name: 'E2E Test User',
                email: 'e2e@test.com',
                message: 'Test message from E2E test'
            };

            // Test the actual API endpoint
            const response = await request(app)
                .post('/api/feedback')
                .send(testFeedback)
                .expect(200);

            expect(response.body.message).to.equal('Feedback submitted successfully');
        });

        // This test verifies the success modal exists
        it('should have success modal', () => {
            const successModal = document.getElementById('successModal');
            expect(successModal).to.exist;
            expect(successModal.querySelector('h4')).to.exist;
            expect(successModal.querySelector('h4').textContent).to.equal('Thank You!');
        });
    });
});