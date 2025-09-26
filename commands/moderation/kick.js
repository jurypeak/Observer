const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

async function sendLog(guild, embed) {
  try {
    const cfg = await GuildConfig.findOne({ guildID: guild.id });
    if (!cfg?.logChannel) return;
    const ch = await guild.channels.fetch(cfg.logChannel).catch(() => null);
    if (ch) await ch.send({ embeds: [embed] }).catch(() => {});
  } catch {}
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(true))
    .addAttachmentOption(opt => opt.setName('proof').setDescription('Optional proof (screenshot, etc.)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const proof = interaction.options.getAttachment('proof');

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'User not found in this server.', ephemeral: true });

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'You lack permission to use this command.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'I do not have permission to kick members.', ephemeral: true });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: "You can't kick yourself.", ephemeral: true });
    }

    if (member.roles?.highest?.position >= interaction.guild.members.me.roles.highest.position || !member.kickable) {
      return interaction.reply({ content: 'I cannot kick this member (insufficient permissions or role hierarchy).', ephemeral: true });
    }

    await member.kick(reason).catch(err => {
      console.error(err);
      return interaction.reply({ content: 'Failed to kick the member.', ephemeral: true });
    });

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('👢 Member Kicked')
      .addFields(
        { name: 'Target', value: `${target.tag} (\`${target.id}\`)` },
        { name: 'Moderator', value: `${interaction.user.tag} (\`${interaction.user.id}\`)` },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();
    if (proof?.url) embed.setImage(proof.url);

    await interaction.reply({ embeds: [embed] });
    await sendLog(interaction.guild, embed);
  }
};
