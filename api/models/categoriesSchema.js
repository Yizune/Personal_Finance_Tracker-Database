const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoriesSchema = new Schema({
    id: {
        type: Number,
        required: true, 
        unique: true, 
        index: true, 
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
    }
},
{ versionKey: false }); // Disable __v field

module.exports = mongoose.model('Categories', categoriesSchema);