const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Put this in Railway variables

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});


// =============================
// SLASH COMMAND REGISTRATION
// =============================
const commands = [
  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Locks the server (Admin only)"),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlocks the server (Admin only)")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔄 Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
})();


// =============================
// READY EVENT
// =============================
client.once("ready", () => {
  console.log(`✅ AstraBot is online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: "Protecting Servers Worldwide",
      type: ActivityType.Playing
    }],
    status: "online"
  });
});


// =============================
// PREFIX COMMANDS
// =============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === "?lockdown server") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You must have Administrator permission.");
    }

    const everyoneRole = message.guild.roles.everyone;

    await message.reply("🔒 Locking server...");

    message.guild.channels.cache.forEach(async (channel) => {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      }).catch(() => {});
    });

    message.channel.send("✅ Server is now in lockdown.");
  }

  if (content === "?unlock server") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You must have Administrator permission.");
    }

    const everyoneRole = message.guild.roles.everyone;

    await message.reply("🔓 Unlocking server...");

    message.guild.channels.cache.forEach(async (channel) => {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      }).catch(() => {});
    });

    message.channel.send("✅ Server has been unlocked.");
  }
});


// =============================
// SLASH COMMAND HANDLER
// =============================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guild) return;

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({
      content: "❌ You must have Administrator permission.",
      ephemeral: true
    });
  }

  const everyoneRole = interaction.guild.roles.everyone;

  if (interaction.commandName === "lockdown") {
    await interaction.reply("🔒 Locking server...");

    interaction.guild.channels.cache.forEach(async (channel) => {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      }).catch(() => {});
    });

    interaction.followUp("✅ Server is now in lockdown.");
  }

  if (interaction.commandName === "unlock") {
    await interaction.reply("🔓 Unlocking server...");

    interaction.guild.channels.cache.forEach(async (channel) => {
      if (!channel.isTextBased()) return;

      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      }).catch(() => {});
    });

    interaction.followUp("✅ Server has been unlocked.");
  }
});

client.login(TOKEN);
