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
const CLIENT_ID = process.env.CLIENT_ID;

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
    .setDescription("Unlocks the server (Admin only)"),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to ban")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false))
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
// READY
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

  const args = message.content.split(" ");
  const command = args[0]?.toLowerCase();

  // ?ban @user reason
  if (command === "?ban") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ You need **Ban Members** permission.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Please mention a user to ban.");

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot ban an administrator.");
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    try {
      await member.ban({ reason });
      message.channel.send(`🔨 ${member.user.tag} has been banned.\nReason: ${reason}`);
    } catch {
      message.reply("❌ I cannot ban this user. Check role hierarchy.");
    }
  }
});


// =============================
// SLASH COMMAND HANDLER
// =============================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guild) return;

  // LOCKDOWN / UNLOCK handled like before (optional to keep)

  if (interaction.commandName === "ban") {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: "❌ You need Ban Members permission.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "❌ User not found in this server.", ephemeral: true });
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "❌ You cannot ban an administrator.",
        ephemeral: true
      });
    }

    try {
      await member.ban({ reason });

      interaction.reply(`🔨 ${user.tag} has been banned.\nReason: ${reason}`);
    } catch {
      interaction.reply({
        content: "❌ I cannot ban this user. Check role hierarchy.",
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
