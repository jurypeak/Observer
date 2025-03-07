const User = require('../../schemas/users');
const { Types } = require('mongoose');

module.exports = (client) => {
    client.fetchUser = async (userId, guildId, name) => {
        let user = await User.findOne({
            userID: userId,
            guildID: guildId,
        });

        if (!user) {
            // If no user is found, create a new user with initial values
            user = new User({
                _id: new Types.ObjectId(),
                userID: userId,
                guildID: guildId,
                name: name,
                dailyStreak: 0,  // Initialize dailyStreak to 0
            });
            // Save the new user and return the user object
            await user.save().catch(console.error);
            return user;
        } else {
            // If user is found, update the name and roles
            user.name = name;
            // Save the updated user and return the user object
            await user.save().catch(console.error);
            return user;
        }
    };
};
