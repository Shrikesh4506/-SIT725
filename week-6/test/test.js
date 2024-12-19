const { expect } = require('chai')
const { MongoClient } = require('mongodb')
const fs = require('fs')

function saveTestResult(result) {
    const timestamp = new Date().toISOString()
    const resultLog = `${timestamp}: ${result}\n`
    fs.appendFileSync('test-results.txt', resultLog)
}

function saveFeedbackDetails(feedbacks) {
    let detailedLog = '\nFEEDBACK DETAILS:\n'

    
    feedbacks.forEach((feedback, index) => {
        detailedLog += `\nFeedback ${index + 1}:\n`
        detailedLog += `Name: ${feedback.name}\n`
        detailedLog += `Email: ${feedback.email}\n`
        detailedLog += `Message: ${feedback.message}\n`
        if (feedback.timestamp) {
            detailedLog += `Time: ${new Date(feedback.timestamp).toLocaleString()}\n`
        }

    })
    
    fs.appendFileSync('test-results.txt', detailedLog)
}

describe('Mocha Tests for Feedback System', function() {
    let client
    let collection

    before(async function() {
        try {
            client = new MongoClient('mongodb://localhost:27017')
            await client.connect()
            saveTestResult('Database Connection: Success')
            collection = client.db('feedback').collection('feedbacks')
        } catch (error) {
            saveTestResult('Database Connection Failed: ' + error.message)
            throw error
        }
    })

    it('The test was a success', async function() {
        try {
            const feedbacks = await collection.find({}).toArray()
            saveTestResult(`Total Feedbacks Found: ${feedbacks.length}`)
            saveFeedbackDetails(feedbacks)
            expect(feedbacks).to.be.an('array')
        } catch (error) {
            saveTestResult('Error retrieving feedback: ' + error.message)
            throw error
        }
    })

    after(async function() {
        if (client) {
            await client.close()
            saveTestResult('Test Session Completed\n')
        }
    })
})