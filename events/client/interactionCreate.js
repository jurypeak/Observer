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
            if (!button) return new Error('Failed to execute button.');
            try {
                // Execute the button's handler function
                await button.execute(interaction, client);
            } catch (error) {
                // Log any errors that occur during button execution
                console.error(error)
            }
        } else if (interaction.isSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = interaction;
            const menu = selectMenus.get(customId);
            if (!menu) return new Error('Failed to execute select menu.');
            try {
                await interaction.deferReply({ ephemeral: true });
                const roleId = interaction.values[0];
                const role = interaction.guild.roles.cache.get(roleId);
                const memberRoles = interaction.member.roles;

                const hasRole = interaction.member.roles.cache.has(roleId);

                if (hasRole) {
                    await memberRoles.remove(roleId);
                    await interaction.followUp({
                        content: `You no longer have the ${role.name} role.`,
                    });
                } else {
                    await memberRoles.add(roleId);
                    await interaction.followUp({
                        content: `You now have the ${role.name} role.`,
                    });
                }
            } catch (error) {
                console.error(error)
            }
        }
    },
};