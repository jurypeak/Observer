const { Schema, model } = require('mongoose');
const cooldownSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userID: String,
    guildID: String,
    command: String,
    endsAt: Date,
});

module.exports = model('Cooldown', cooldownSchema, 'cooldowns');