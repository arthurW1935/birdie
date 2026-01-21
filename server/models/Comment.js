const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 280
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);