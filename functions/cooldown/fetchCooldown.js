const Cooldown = require('../../schemas/cooldown');
const { Types } = require('mongoose');

module.exports = (client) => {
    client.fetchCooldown = async (userId, guildId, command) => {
        // Find the cooldown document for the specific user, guild, and command.
        let cooldown = await Cooldown.findOne({
            userID: userId,
            guildID: guildId,
            command: command
        });

        // If no cooldown document exists, create a new one
        if (!cooldown) {
            cooldown = new Cooldown({
                _id: new Types.ObjectId(),
                userID: userId,
                guildID: guildId,
                command: command,
                endsAt: 0, // Initial placeholder value for endsAt, this will be updated later
            });

            try {
                await cooldown.save();
            } catch (error) {
                console.error('Error creating cooldown document:', error);
            }
        }

        return cooldown;
    };
};
