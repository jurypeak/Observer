const fs = require("fs");
const { connection } = require('mongoose');

// Function to handle loading and registering events
module.exports = (client) => {
    client.handleEvents = async () => {
        // Read the events directory to find event folders
        const eventFolders = fs.readdirSync(`./events`);
        for (const folder of eventFolders) {
            // Read event files inside each folder, filtering for .js files
            const eventFiles = fs
                .readdirSync(`./events/${folder}`)
                .filter((file) => file.endsWith(".js"));

            // Handle different event categories
            switch (folder) {
                case "client":
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`);
                        // If the event should be executed only once, use .once(), otherwise use .on()
                        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
                        else client.on(event.name, (...args) => event.execute(...args, client));
                    }
                    break;
                case "mongo":
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`);
                        if (event.once) connection.once(event.name, (...args) =>
                            event.execute(...args, client)
                        );
                        else connection.on(event.name, (...args) =>
                            event.execute(...args, client)
                        );
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
