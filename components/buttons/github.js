module.exports = {
    // The data object that contains the button's properties
    data: {
        // The unique name identifier for this button
        // This name must match the customId used when creating the button in Discord
        name: `github`,
    },

    // The execute function that runs when the button is clicked
    // It takes the interaction object (the button click) and client as parameters
    async execute(interaction, client) {
        // When the button is clicked, this replies to the interaction
        // with a GitHub profile link
        await interaction.reply({
            content: `https://github.com/jurypeak`
        });
    }
};