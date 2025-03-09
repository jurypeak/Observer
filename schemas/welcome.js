const { Schema, model } = require('mongoose');

const welcomeSchema = new Schema({
    _id: Schema.Types.ObjectId,
    channelID: { type: String, required: true, unique: true },
    guildID: { type: String, required: true },
    customMessage: { type: String, default: null },
}, { timestamps: true }
);

module.exports = model('Welcome', welcomeSchema, 'welcomes');