// Event handler for interactionCreate event
module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        // Check if the interaction is a chat input command
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            // If the command does not exist, exit the function
            if (!command) return;
            try {
                // Execute the command
                await command.execute(interaction, client);
            } catch (error) {
                // Log any errors that occur during command execution
                console.error(error);
                // Send a visible to interactive-user reply to the user indicating an error occurred
                await interaction.reply({
                    content: `Something went wrong.`,
                    ephemeral: true
                });
            }
        } else if (interaction.isButton()) {
            // Handle button interactions
            const { buttons } = client;
            const { customId } = interaction;
            // Get the button handler based on the customId
            const button = buttons.get(customId);
            // If no button handler is found, log an error and exit
            if (!button) return console.error('Failed to execute button.');
            try {
                // Execute the button's handler function
                await button.execute(interaction, client);
            } catch (error) {
                // Log any errors that occur during button execution
                console.error(error)
            }
        }
    },
};