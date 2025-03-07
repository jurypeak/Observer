const User = require('../../schemas/users');

module.exports = (client) => {
    client.getUser = async (userId, guildId) => {
        const user = await User.findOne({
            userID: userId,
            guildID: guildId,
        });
        if (!user) return false;
        else return user;
    };
};