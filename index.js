const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ AstraBot is online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "Protecting Servers Worldwide",
        type: ActivityType.Playing
      }
    ],
    status: "online"
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // Command
  if (message.content.toLowerCase() === "?lockdown server") {

    // Admin check
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You must have **Administrator** permissions to use this command.");
    }

    const everyoneRole = message.guild.roles.everyone;

    message.reply("🔒 Locking down the server...");

    // Lock all text channels
    message.guild.channels.cache.forEach(async (channel) => {
      if (!channel.isTextBased()) return;

      try {
        await channel.permissionOverwrites.edit(everyoneRole, {
          SendMessages: false
        });
      } catch (err) {
        console.error(`Failed to lock ${channel.name}`);
      }
    });

    message.channel.send("✅ **Server is now in lockdown.** Only admins can speak.");
  }
});

// Login
client.login(process.env.TOKEN);
