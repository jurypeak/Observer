// Import the readdirSync function from the fs module to read directory contents
const { readdirSync } = require("fs");

// Export a function that takes a client parameter
module.exports = (client) => {
    // Define an async method 'handleComponents' on the client object
    client.handleComponents = async () => {
        // Read all folders within the './components' directory
        const componentFolders = readdirSync(`./components`);
        // Loop through each folder found
        for (const folder of componentFolders) {
            // For each folder, read all JavaScript files inside it
            const componentFiles = readdirSync(`./components/${folder}`).filter(
                (file) => file.endsWith(".js")
            );

            // Destructure 'buttons' from the client object
            const { buttons } = client;

            // Use a switch statement to handle different component types
            switch (folder) {
                case "buttons":
                    // If the folder is "buttons", process each JavaScript file
                    for (const file of componentFiles) {
                        // Require (import) the button module from its file
                        const button = require(`../../components/${folder}/${file}`);
                        // Add the button to the buttons collection using its name as the key
                        // This is where the error occurs if 'buttons' is undefined
                        buttons.set(button.data.name, button);
                    }
                    break;

                // Space for handling other component types in the future
                default:
                    break;
            }
        }
    };
};