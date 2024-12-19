const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/feedback', (req, res) => feedbackController.createFeedback(req, res));

module.exports = router;