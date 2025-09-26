const { Events } = require('discord.js');
const Level = require('../../schemas/level');
const GuildConfig = require('../../schemas/guildconfig');

const VOICE_XP_EVERY_MINUTES = 2; // award interval
const VOICE_XP_AMOUNT = 10; // xp per interval

// In-memory tracker of users currently in voice and their last credited timestamp
const voiceSessions = new Map(); // key: guildID-userID, value: { joinedAt: number, lastCreditedAt: number }

function key(guildId, userId) { return `${guildId}-${userId}`; }

function xpForLevel(level) { return 100 * level; }

async function ensureDoc(guildID, userID) {
  let doc = await Level.findOne({ guildID, userID });
  if (!doc) doc = await Level.create({ guildID, userID, xp: 0, level: 0 });
  return doc;
}

async function creditXP(guild, userId, intervals) {
  if (intervals <= 0) return null;
  const doc = await ensureDoc(guild.id, userId);
  let added = VOICE_XP_AMOUNT * intervals;
  doc.xp += added;
  let leveledUp = false;
  while (doc.xp >= xpForLevel(doc.level + 1)) {
    doc.level += 1;
    leveledUp = true;
  }
  await doc.save();

  if (leveledUp) {
    try {
      const config = await GuildConfig.findOne({ guildID: guild.id });
      if (config?.levelChannel) {
        const channel = await guild.channels.fetch(config.levelChannel).catch(() => null);
        if (channel) {
          await channel.send({ content: `🎙️ <@${userId}> reached **Level ${doc.level}** from voice activity!` }).catch(() => {});
        }
      }
    } catch {}

    if (doc.level % 5 === 0) {
      const roleName = `Level ${doc.level}`;
      const role = guild.roles.cache.find(r => r.name === roleName) || null;
      if (role) {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (member && member.manageable) {
          await member.roles.add(role).catch(() => {});
        }
      }
    }
  }

  return added;
}

// Periodic credit for ongoing sessions
let intervalStarted = false;
function startInterval(client) {
  if (intervalStarted) return;
  intervalStarted = true;
  setInterval(async () => {
    const now = Date.now();
    for (const [k, session] of voiceSessions.entries()) {
      const [guildId, userId] = k.split('-');
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;
      const elapsed = now - (session.lastCreditedAt || session.joinedAt);
      const intervals = Math.floor(elapsed / (VOICE_XP_EVERY_MINUTES * 60 * 1000));
      if (intervals > 0) {
        await creditXP(guild, userId, intervals).catch(() => {});
        session.lastCreditedAt = (session.lastCreditedAt || session.joinedAt) + intervals * VOICE_XP_EVERY_MINUTES * 60 * 1000;
      }
    }
  }, 60 * 1000);
}

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState, client) {
    try {
      startInterval(client);

      const member = newState.member || oldState.member;
      if (!member || member.user?.bot) return;
      const guild = member.guild;
      const k = key(guild.id, member.id);

      const oldChannel = oldState.channelId;
      const newChannel = newState.channelId;

      // If user leaves voice completely
      if (oldChannel && !newChannel) {
        const session = voiceSessions.get(k);
        if (session) {
          const now = Date.now();
          const elapsed = now - (session.lastCreditedAt || session.joinedAt);
          const intervals = Math.floor(elapsed / (VOICE_XP_EVERY_MINUTES * 60 * 1000));
          if (intervals > 0) await creditXP(guild, member.id, intervals).catch(() => {});
          voiceSessions.delete(k);
        }
        return;
      }

      // If user joins voice
      if (!oldChannel && newChannel) {
        voiceSessions.set(k, { joinedAt: Date.now(), lastCreditedAt: null });
        return;
      }

      // If user moves between channels, keep the session running but credit pending time
      if (oldChannel && newChannel && oldChannel !== newChannel) {
        const session = voiceSessions.get(k);
        const now = Date.now();
        if (session) {
          const elapsed = now - (session.lastCreditedAt || session.joinedAt);
          const intervals = Math.floor(elapsed / (VOICE_XP_EVERY_MINUTES * 60 * 1000));
          if (intervals > 0) await creditXP(guild, member.id, intervals).catch(() => {});
          session.lastCreditedAt = now;
        } else {
          voiceSessions.set(k, { joinedAt: now, lastCreditedAt: null });
        }
      }

    } catch (err) {
      console.error('Error in voice-xp:', err);
    }
  }
};
