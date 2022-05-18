const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true,
        trim: true
    },
    flow: {
        type: String,
        enum: ['Money In', 'Money Out'],
        required: true,
        trim: true,
        audoIndex: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) throw new Error("Amount must be greater than zero");
        }
    },
    note: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;