const express = require('express');
const router = express.Router();
const { 
    getTweets, 
    createTweet, 
    likeTweet, 
    deleteTweet, 
    getComments,
    addComment,
    deleteComment,
    getNotifications
} = require('../controllers/tweetController');
const { protect } = require('../middleware/authMiddleware');

// Public Route
router.get('/', protect, getTweets);
router.get('/:id/comments', getComments);

// Protected Routes (Must have Token)
router.post('/', protect, createTweet);
router.patch('/:id/like', protect, likeTweet);
router.delete('/:id', protect, deleteTweet);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);
router.get('/notifications', protect, getNotifications);

module.exports = router;