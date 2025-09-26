const { Schema, model } = require("mongoose");

const guildConfigSchema = new Schema({
    guildID: { type: String, required: true, unique: true },
    guildName: String,
    guildIcon: { type: String, required: false },

    // System channels
    welcomeChannel: { type: String, default: null },
    logChannel: { type: String, default: null },
    levelChannel: { type: String, default: null },
    musicChannel: { type: String, default: null },
    gambleChannel: { type: String, default: null },
    keyChannel: { type: String, default: null },
}, { timestamps: true });

module.exports = model("GuildConfig", guildConfigSchema, "guildConfigs");
