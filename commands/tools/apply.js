const { SlashCommandBuilder} = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
    .setName('Apply')
    .setDescription('Apply for verification.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('Your name. Required for nickname change.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('age')
            .setDescription('Your age. Required for verification.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('How did you find Astral')
            .setDescription('How did you find Astral? If you were invited, please provide the name of the person who invited you.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('Why are you interested in Astral')
            .setDescription('What interests you about Astral?')
            .setRequired(true)),
};