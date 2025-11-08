const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionsSchema = new Schema({
    id: {
        type: Number, 
        required: true, 
        unique: true, 
        index: true,  
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        enum: 
        [
            'Salary', 
            'Freelance', 
            'Food', 
            'Entertainment', 
            'Rent', 
            'Utilities', 
            'Transportation', 
            'Investment', 
            'Part-time Job', 
            'Shopping', 
            'Miscellaneous'
        ],
        required: true
    },

    date: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: false
    },
},
{ versionKey: false }); // Disable __v field

module.exports = mongoose.model('Transaction', transactionsSchema);