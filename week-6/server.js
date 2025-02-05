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

// Start server only if running directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;