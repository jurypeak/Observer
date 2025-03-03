// Discord bot status
// Author: Jayden Robertson (Proxill)
// Created: 03/03/2025
// Last modified: 03/03/2025

const { ActivityType, PresenceUpdateStatus } = require('discord.js');

module.exports = {
    name: 'ready', 
    once: true,    
    execute(client) {
        client.user.setPresence({
            activities: [{
                name: 'Asteroids',
                type: ActivityType.Watching
            }],
            status: PresenceUpdateStatus.Online 
        });
    }
};