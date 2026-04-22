const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    color: {
        type: String,
        default: 'bg-indigo-500'
    },
    isEmergencyFund: {
        type: Boolean,
        default: false
    },
    history: [{
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
