const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creditor: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    apr: {
        type: Number,
        required: true
    },
    minPayment: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
