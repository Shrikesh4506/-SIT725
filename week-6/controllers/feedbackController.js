// controllers/feedbackController.js
const FeedbackModel = require('../models/Feedback');

class FeedbackController {
    async createFeedback(req, res) {
        try {
            // Validate required fields
            if (!req.body.name || !req.body.email || !req.body.message) {
                return res.status(500).json({ 
                    statusCode: 500, 
                    message: 'Name, email and message are required' 
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(500).json({ 
                    statusCode: 500, 
                    message: 'Invalid email format' 
                });
            }

            const feedbackModel = new FeedbackModel(global.db);
            const feedback = {
                name: req.body.name,
                email: req.body.email,
                message: req.body.message
            };

            await feedbackModel.create(feedback);
            res.json({ statusCode: 200, message: 'Feedback submitted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ statusCode: 500, message: 'Error submitting feedback' });
        }
    }
}

module.exports = new FeedbackController();