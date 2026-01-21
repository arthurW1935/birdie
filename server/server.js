require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const tweetRoutes = require('./routes/tweetRoutes')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.send('Birdie Backend is Running!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('Database Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));