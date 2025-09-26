const { Events, EmbedBuilder } = require('discord.js');
const Level = require('../../schemas/level');
const GuildConfig = require('../../schemas/guildconfig');

const BASE_MSG_XP = 10;
const ATTACHMENT_BONUS_MULTIPLIER = 2; // double xp for messages with attachments

function xpForLevel(level) {
  // Progressive curve: 100 * level
  return 100 * level;
}

async function ensureDoc(guildID, userID) {
  let doc = await Level.findOne({ guildID, userID });
  if (!doc) doc = await Level.create({ guildID, userID, xp: 0, level: 0 });
  return doc;
}

async function handleLevelUp(message, doc, addedXP) {
  doc.xp += addedXP;

  // Check for level-ups (may skip multiple levels if XP jumps)
  let leveledUp = false;
  while (doc.xp >= xpForLevel(doc.level + 1)) {
    doc.level += 1;
    leveledUp = true;
  }
  await doc.save();

  if (!leveledUp) return;

  // Announce in level channel if configured
  try {
    const config = await GuildConfig.findOne({ guildID: message.guild.id });
    if (config?.levelChannel) {
      const levelChannel = await message.guild.channels.fetch(config.levelChannel).catch(() => null);
      if (levelChannel) {
        const embed = new EmbedBuilder()
          .setColor('#43B581')
          .setTitle('🎉 Level Up!')
          .setDescription(`<@${message.author.id}> reached **Level ${doc.level}**`)
          .addFields(
            { name: 'Total XP', value: `${doc.xp}`, inline: true },
            { name: 'Next Level At', value: `${xpForLevel(doc.level + 1)} XP`, inline: true }
          )
          .setTimestamp();
        await levelChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  } catch {}

  // Role reward every 5 levels: try to grant role named "Level <n>" if exists
  if (doc.level % 5 === 0) {
    const roleName = `Level ${doc.level}`;
    const role = message.guild.roles.cache.find(r => r.name === roleName) || null;
    if (role) {
      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (member && member.manageable) {
        await member.roles.add(role).catch(() => {});
      }
    }
  }
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      if (!message.guild) return;
      if (message.author.bot) return;

      const guildID = message.guild.id;
      const userID = message.author.id;

      const hasAttachment = message.attachments?.size > 0;
      const xp = hasAttachment ? BASE_MSG_XP * ATTACHMENT_BONUS_MULTIPLIER : BASE_MSG_XP;

      const doc = await ensureDoc(guildID, userID);
      await handleLevelUp(message, doc, xp);

    } catch (err) {
      console.error('Error in xp-tracker (messages):', err);
    }
  }
};
