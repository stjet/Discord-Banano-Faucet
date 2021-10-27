const Discord = require('discord.js');
const client = new Discord.Client();

const keep_alive = require('./keep_alive.js');
const banano = require('./banano.js');

const {token} = process.env;

const prefix = "f!";

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {  
  if (message.author.bot) return;
  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  if (message.content.toLowerCase().startsWith(prefix+"faucet")) {
    let addr = args[0];
    if (await banano.faucet_dry()) {
      return message.channel.send("Faucet dry, please donate at `ban_3zfejadzxggf946dbp4tknqbc8pufo1xwipa3ka81w9yds61ynsustqkmxjo`");
    }
    let is_valid = await banano.is_valid(addr);
    if (!is_valid) {
      return message.channel.send("Invalid Banano address");
    }
    let send = await banano.send_banano(addr, message.author.id, 0.01);
    if (!send) {
      return message.channel.send("Last claim too soon")
    }
    message.channel.send("Success, https://yellowspyglass.com/hash/"+send);
  }
});

client.login(token);