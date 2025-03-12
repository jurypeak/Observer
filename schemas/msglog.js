const { Schema, model} = require('mongoose');

const msglogSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildID: String,
    channelID: String,
    logChannelID: String,
});

module.exports = model('MessageLog', msglogSchema, 'msglogs');