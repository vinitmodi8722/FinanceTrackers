const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Fixed Deposit', 'Mutual Fund'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        alias: 'investedAmount'
    },
    interestRate: {
        type: Number, // For FD
    },
    duration: {
        type: Number, // Duration in months for FD
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    maturityDate: {
        type: Date, // For FD
    },
    nav: {
        type: Number, // For Mutual Fund
    },
    units: {
        type: Number, // For Mutual Fund
    },
    currentValue: {
        type: Number, // Current valuation
    },
    category: {
        type: String, // Equity, Debt, Hybrid etc.
    },
    institution: {
        type: String, // Bank name or AMC
    }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
