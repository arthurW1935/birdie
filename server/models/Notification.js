const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // ERROR SOURCE: If 'follow' is missing here, it crashes.
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true }, 
    tweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }, // Optional for follows
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);