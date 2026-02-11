const { 
  Client, 
  GatewayIntentBits, 
  ActivityType 
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

// Login
client.login(process.env.TOKEN);
