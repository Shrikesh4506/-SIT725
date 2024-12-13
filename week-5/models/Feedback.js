class FeedbackModel {
    constructor(db) {
        this.collection = db.collection('feedback');
    }

    async create(feedbackData) {
        try {
            feedbackData.createdAt = new Date();
            const result = await this.collection.insertOne(feedbackData);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            return await this.collection.find({}).toArray();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FeedbackModel;