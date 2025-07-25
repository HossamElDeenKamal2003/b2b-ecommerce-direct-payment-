// src/confiq/dbConfiq.js
const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;