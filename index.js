const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const queue = require('./utils/queue'); // queue 가져오기

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
});

// 명령어 관리
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// 디버깅 로그로 queue 상태 출력
console.log('초기 Queue 상태:', queue);

client.once('ready', () => {
  console.log(`${client.user.tag} 봇이 준비되었습니다!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('명령어 실행 중 오류 발생:', error);
    await interaction.reply({ content: '명령어 실행 중 문제가 발생했습니다.', ephemeral: true });
  }
});

client.login(token);
