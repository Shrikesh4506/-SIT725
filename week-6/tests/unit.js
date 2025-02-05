// tests/unit.js
const { expect } = require('chai');
const sinon = require('sinon');
const FeedbackModel = require('../models/Feedback');

describe('FeedbackModel Unit Tests', () => {
    let feedbackModel;
    let mockDb;
    let mockCollection;

    beforeEach(() => {
        // Create mock collection with stub methods
        mockCollection = {
            insertOne: sinon.stub().resolves({ insertedId: 'test-id' }),
            find: sinon.stub().returns({
                toArray: sinon.stub().resolves([])
            })
        };

        // Create mock db
        mockDb = {
            collection: sinon.stub().returns(mockCollection)
        };

        feedbackModel = new FeedbackModel(mockDb);
    });

    describe('create() method', () => {
        it('should add timestamp and save feedback', async () => {
            const testData = {
                name: 'Test User',
                email: 'test@example.com',
                message: 'Test message'
            };

            const result = await feedbackModel.create(testData);
            expect(result).to.have.property('insertedId', 'test-id');
            expect(mockDb.collection.calledWith('feedback')).to.be.true;
            expect(mockCollection.insertOne.calledOnce).to.be.true;

            const savedData = mockCollection.insertOne.getCall(0).args[0];
            expect(savedData).to.have.property('createdAt');
            expect(savedData.createdAt).to.be.instanceOf(Date);
        });
    });

    describe('getAll() method', () => {
        it('should return all feedback entries', async () => {
            // Prepare mock data
            const mockFeedbacks = [
                { id: 1, name: 'User1', message: 'Message1' },
                { id: 2, name: 'User2', message: 'Message2' }
            ];

            // Setup the mock to return our test data
            mockCollection.find().toArray.resolves(mockFeedbacks);

            // Call the method
            const result = await feedbackModel.getAll();

            // Verify the results
            expect(result).to.deep.equal(mockFeedbacks);
            expect(mockDb.collection.calledWith('feedback')).to.be.true;
            expect(mockCollection.find.called).to.be.true;
        });
    });
});