const User = require('../models/User');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// @desc    Get all tweets (Sorted by Following + Chronological)
// @route   GET /api/tweets
const getTweets = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        
        // Safety: Ensure followingIds is an array, even if database field is missing
        const followingIds = currentUser.following || []; 

        const tweets = await Tweet.aggregate([
            // 1. Join with Users to get author info
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },

            // 2. THIS WAS MISSING: Join with Comments to get reply counts
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'tweetId',
                    as: 'comments'
                }
            },

            // 3. Mark tweets as "isFollowing" if the author is in your following list
            {
                $addFields: {
                    isFollowing: { $in: ['$userId', followingIds] }
                }
            },

            // 4. Sort: Followed users first, then by date (Newest first)
            { 
                $sort: { 
                    isFollowing: -1, 
                    createdAt: -1    
                } 
            },

            // 5. Select only the fields we need to send to the app
            {
                $project: {
                    _id: 1, 
                    content: 1, 
                    image: { $ifNull: ["$image", null] },
                    likes: 1, 
                    createdAt: 1, 
                    isFollowing: 1,
                    replyCount: { $size: "$comments" }, // Now this works because we did the lookup above!
                    'userId._id': '$user._id',
                    'userId.username': '$user.username',
                    'userId.email': '$user.email',
                    'userId.bio': '$user.bio',
                    'userId.followers': '$user.followers', 
                    'userId.following': '$user.following'
                }
            }
        ]);

        res.status(200).json(tweets);
    } catch (error) {
        console.error("Backend Error in getTweets:", error); // <--- Logs error to your terminal
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new tweet (with optional image)
// @route   POST /api/tweets
const createTweet = async (req, res) => {
    // 1. Destructure image from body
    const { content, image } = req.body; 

    if (!content && !image) {
        return res.status(400).json({ message: 'Content or image is required' });
    }

    try {
        let imageUrl = '';

        // 2. If an image is provided, upload it to Cloudinary
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: 'birdie_posts',      // Folder name in Cloudinary
            });
            imageUrl = uploadRes.secure_url;
        }

        // 3. Create Tweet in DB with the Cloudinary URL
        const tweet = await Tweet.create({
            userId: req.user.id,
            content: content || "", // Allow empty text if image exists
            image: imageUrl
        });

        // 4. Populate user info so the feed can display it immediately
        const fullTweet = await Tweet.findById(tweet._id).populate('userId', 'username email');

        res.status(201).json(fullTweet);
    } catch (error) {
        console.error("Create Tweet Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like or Unlike a tweet
// @route   PATCH /api/tweets/:id/like
const likeTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        // Check if user has already liked
        if (tweet.likes.includes(req.user.id)) {
            // UNLIKE logic (keep existing)
            tweet.likes = tweet.likes.filter(id => id.toString() !== req.user.id);
        } else {
            // LIKE logic
            tweet.likes.push(req.user.id);

            // --- NEW: Create Notification ---
            // Don't notify if liking your own tweet
            if (tweet.userId.toString() !== req.user.id) {
                await Notification.create({
                    recipient: tweet.userId,
                    sender: req.user.id,
                    type: 'like',
                    tweetId: tweet._id
                });
            }
        }

        await tweet.save();
        res.status(200).json(tweet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a tweet
// @route   DELETE /api/tweets/:id
const deleteTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);

        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        // Ensure only the owner can delete
        if (tweet.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this tweet' });
        }

        await tweet.deleteOne(); // or tweet.remove() depending on mongoose version
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a tweet
// @route   GET /api/tweets/:id/comments
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ tweetId: req.params.id })
            .sort({ createdAt: -1 }) // Newest first
            .populate('userId', 'username'); // Get commenter's name
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a comment to a tweet
// @route   POST /api/tweets/:id/comments
const addComment = async (req, res) => {
    if (!req.body.content) {
        return res.status(400).json({ message: 'Comment content required' });
    }

    try {
        const comment = await Comment.create({
            content: req.body.content,
            tweetId: req.params.id,
            userId: req.user.id
        });

        // Populate user info immediately for the UI
        const populatedComment = await comment.populate('userId', 'username');
        
        const tweet = await Tweet.findById(req.params.id);
        if (tweet && tweet.userId.toString() !== req.user.id) {
            await Notification.create({
                recipient: tweet.userId,
                sender: req.user.id,
                type: 'comment',
                tweetId: tweet._id
            });
        }

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/tweets/comments/:id
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ensure only the comment author can delete it
        if (comment.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notifications
// @route   GET /api/tweets/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username') // Get sender name
            // FIX: Deeply populate the tweet AND its author
            .populate({
                path: 'tweetId',
                populate: {
                    path: 'userId',
                    select: 'username email' // We need this for the Detail Screen
                }
            });
        
        // Filter out notifications where the tweet has been deleted (tweetId is null)
        const validNotifications = notifications.filter(n => n.tweetId !== null);

        res.status(200).json(validNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getTweets, 
    createTweet, 
    likeTweet, 
    deleteTweet, 
    getComments, 
    addComment,
    deleteComment,
    getNotifications
};