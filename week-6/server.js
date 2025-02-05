// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const feedbackRoutes = require('./routes/feedbackRoutes');

function createServer() {
    const app = express();
    app.use(express.json());
    app.use(express.static('public'));

    // Database connection
    const url = 'mongodb://localhost:27017';
    const dbName = process.env.NODE_ENV === 'test' ? 'feedback_test' : 'feedback';

    MongoClient.connect(url)
        .then(client => {
            console.log('Connected to MongoDB successfully');
            global.db = client.db(dbName);
            console.log('Database selected:', dbName);
        })
        .catch(err => console.error('MongoDB connection error:', err));

    // Routes
    app.use('/api', feedbackRoutes);

    return app;
}

// Create the app instance
const app = createServer();

// Start server only if running directly (not in test mode)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    
    // Try to start the server
    const server = app.listen(PORT)
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
                // Try next port
                server.listen(PORT + 1);
            } else {
                console.error('Server error:', err);
            }
        })
        .on('listening', () => {
            const address = server.address();
            console.log(`Server running on port ${address.port}`);
        });
}

module.exports = app;