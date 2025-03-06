const { Schema, model } = require('mongoose');
const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userID: { type: String, required: true },
    guildID: { type: String, required: true },
    name: String,
    roles: String,
    dailyStreak: { type: Number, default: 0 },
});

module.exports = model('User', userSchema, 'users');