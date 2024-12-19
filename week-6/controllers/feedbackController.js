const FeedbackModel = require('../models/Feedback');

class FeedbackController {
    async createFeedback(req, res) {
        try {
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