const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

const url = 'mongodb://localhost:27017';
const dbName = 'feedback';  
let db;

MongoClient.connect(url)
   .then(client => {
       console.log('Connected to MongoDB successfully');
       db = client.db(dbName);
       console.log('Database selected:', dbName);
   })
   .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
   console.log('User connected');
   
   if (db) {
       db.collection('feedbacks').find().toArray()
           .then(feedbacks => {
               socket.emit('initial-feedbacks', feedbacks);
           })
           .catch(err => console.error('Error fetching feedbacks:', err));
   }

   socket.on('disconnect', () => {
       console.log('User disconnected');
   });
});

app.post('/api/feedback', async (req, res) => {
   try {
       console.log('Received feedback data:', req.body);
       
       if (!db) {
           console.error('Database not connected');
           return res.status(500).json({ statusCode: 500, message: 'Database not connected' });
       }

       const feedbackCollection = db.collection('feedbacks');  
       const result = await feedbackCollection.insertOne(req.body);
       
       io.emit('new-feedback', req.body);
       
       console.log('Data saved successfully:', result);
       res.json({ statusCode: 200, message: 'Feedback submitted successfully' });
   } catch (error) {
       console.error('Error saving feedback:', error);
       res.status(500).json({ statusCode: 500, message: 'Error submitting feedback' });
   }
});

const PORT = 3000;
server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});