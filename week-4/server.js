
const express = require('express')
const { MongoClient } = require('mongodb')
const path = require('path')
const app = express()


const uri = "mongodb://127.0.0.1:27017/Test" 
const client = new MongoClient(uri)
let collection

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

async function connectToDatabase() {
    try {
        await client.connect()
        console.log('MongoDB Connected successfully')
        
        const db = client.db('Test')
        collection = db.collection('feedback')
        await collection.findOne({})
        console.log('Database connection verified')
        
        return true
    } catch (error) {
        console.error('Database Connection Error:', error)
        return false
    }
}

app.post('/api/feedback', async (req, res) => {
    try {
        if (!collection) {
            await connectToDatabase()
            if (!collection) {
                throw new Error('Unable to connect to database')
            }
        }

        console.log('Received feedback data:', req.body)

        if (!req.body.name || !req.body.email || !req.body.message) {
            throw new Error('Missing required fields')
        }

        const feedback = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            timestamp: new Date()
        }

        const result = await collection.insertOne(feedback)
        console.log('Feedback inserted:', result)

        res.json({
            statusCode: 200,
            data: result,
            message: "Feedback Successfully Submitted"
        })
    } catch (error) {
        console.error('Error in /api/feedback:', error)
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Internal server error'
        })
    }
})

app.get('/api/feedback', async (req, res) => {
    try {
        if (!collection) {
            await connectToDatabase()
            if (!collection) {
                throw new Error('Unable to connect to database')
            }
        }

        const feedback = await collection.find({}).toArray()
        res.json({
            statusCode: 200,
            data: feedback,
            message: "Success"
        })
    } catch (error) {
        console.error('Error in GET /api/feedback:', error)
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Internal server error'
        })
    }
})

const port = 3000
app.listen(port, async () => {
    console.log(`Server running on port ${port}`)
    
    try {
        const connected = await connectToDatabase()
        if (connected) {
            console.log('Initial database connection successful')
        } else {
            console.log('Initial database connection failed')
        }
    } catch (error) {
        console.error('Startup error:', error)
    }
})

process.on('SIGINT', async () => {
    try {
        await client.close()
        console.log('MongoDB connection closed')
        process.exit(0)
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
})