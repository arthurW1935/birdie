const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token lasts 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create user (password hashing happens in Model pre-save)
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Check user and password match
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.username = req.body.username || user.username;
        user.bio = req.body.bio || user.bio; // Update Bio

        if (req.body.password) {
            // Check old password first
            if (!req.body.oldPassword) {
                return res.status(400).json({ message: 'Please provide old password to set a new one' });
            }
            const isMatch = await user.matchPassword(req.body.oldPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Old password incorrect' });
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            bio: updatedUser.bio,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Search users by username
// @route   GET /api/auth/search?q=username
const searchUsers = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Query required" });

    try {
        // Find users where username contains query (case-insensitive)
        const users = await User.find({ 
            username: { $regex: query, $options: 'i' } 
        }).select('_id username bio email'); // Only return public info

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Follow/Unfollow a user
// @route   POST /api/auth/follow/:id
const followUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize arrays if they don't exist (Safety Check)
        if (!currentUser.following) currentUser.following = [];
        if (!userToFollow.followers) userToFollow.followers = [];

        // Check if already following
        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            // UNFOLLOW LOGIC
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
        } else {
            // FOLLOW LOGIC
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user.id);

            // Create Notification (Safe Mode)
            try {
                await Notification.create({
                    recipient: userToFollow._id,
                    sender: currentUser._id,
                    type: 'follow'
                    // Note: We DO NOT send tweetId for follows
                });
            } catch (notifyError) {
                console.log("Notification creation failed:", notifyError.message);
                // We do not stop the response; the follow still succeeded.
            }
        }

        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({ 
            following: currentUser.following,
            followers: userToFollow.followers 
        });

    } catch (error) {
        console.error("Follow Error:", error); // Check your terminal for this log!
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/auth/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers following');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            followers: user.followers,
            following: user.following
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    searchUsers,
    followUser,
    getUserById
};