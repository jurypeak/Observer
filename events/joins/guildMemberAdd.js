const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        try {
            // Forward to the existing welcome-message handler for consistent behavior
            client.emit('send-welcome-message', member);
        } catch (err) {
            console.error('Error handling GuildMemberAdd:', err);
        }
    }
};
