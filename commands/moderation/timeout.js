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

function minutesToMs(mins) {
  const n = Number(mins);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * 60 * 1000;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member for a specified number of minutes')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the timeout').setRequired(true))
    .addAttachmentOption(opt => opt.setName('proof').setDescription('Optional proof (screenshot, etc.)').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason');
    const proof = interaction.options.getAttachment('proof');

    const ms = minutesToMs(minutes);
    if (!ms) return interaction.reply({ content: 'Please provide a valid number of minutes (>0).', ephemeral: true });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'User not found in this server.', ephemeral: true });

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'You lack permission to use this command.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'I do not have permission to timeout members.', ephemeral: true });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: "You can't timeout yourself.", ephemeral: true });
    }

    if (member.roles?.highest?.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot timeout this member (role hierarchy).', ephemeral: true });
    }

    await member.timeout(ms, reason).catch(err => {
      console.error(err);
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('⏳ Member Timed Out')
      .addFields(
        { name: 'Target', value: `${target.tag} (\`${target.id}\`)` },
        { name: 'Moderator', value: `${interaction.user.tag} (\`${interaction.user.id}\`)` },
        { name: 'Duration', value: `${minutes} minute(s)` },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();
    if (proof?.url) embed.setImage(proof.url);

    await interaction.reply({ embeds: [embed] });
    await sendLog(interaction.guild, embed);
  }
};
