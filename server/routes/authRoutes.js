const { registerUser, loginUser, updateUserProfile, searchUsers, followUser, getUserById } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const express = require('express');
const router = express.Router();

// POST/PUT routes first
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.post('/follow/:id', protect, followUser);

// GET routes with specific paths before generic :id
router.get('/me', protect, (req, res) => {
    // If 'protect' passes, req.user is populated. Return it.
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
        followers: req.user.followers,
        following: req.user.following
    });
});

router.get('/search', protect, searchUsers);

// Generic :id route LAST
router.get('/:id', protect, getUserById);

module.exports = router;