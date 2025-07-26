const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    verify: {
        type: Boolean,
        default: false
    },
    address:{
        type: String,
        required: true
    },
    googleMapLink: {
        type: String,
        required: true,
    },
    block: {
        type: Boolean,
        default: false
    },
    waiting: {
        type: Boolean,
        default: true
    },
    nationalId: {
        type: String
    },
    imageOftrading: {
        type: String
    },
    nationalId2: {
        type: String
    },
    imageOfnationalId:{
        type:String
    },
    Iban: {
        type: String
    },
    nameOfbank: {
        type: String
    },
    nameOfperson: {
        type: String
    },
    imageOfiban: {
        type: String
    },
    imageOffront: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const trader = mongoose.model('Trader', userSchema);
module.exports = trader;