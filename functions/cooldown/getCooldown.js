const Cooldown = require('../../schemas/cooldown');

module.exports = (client) => {
    client.getCooldown = async (userId, guildId) => {
        const cooldown = await Cooldown.findOne({
            userID: userId,
            guildID: guildId,
        });
        if (!cooldown) return false;
        else return cooldown;
    };
};