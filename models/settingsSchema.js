const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingsSchema = new Schema({
    darkMode: {
        type: Boolean
    }
},
{ versionKey: false }); // Disable __v field

module.exports = mongoose.model('Settings', settingsSchema);