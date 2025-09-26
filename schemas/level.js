const { Schema, model } = require('mongoose');

const levelSchema = new Schema({
  guildID: { type: String, required: true, index: true },
  userID: { type: String, required: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
}, { timestamps: true });

levelSchema.index({ guildID: 1, userID: 1 }, { unique: true });

module.exports = model('Level', levelSchema, 'levels');
