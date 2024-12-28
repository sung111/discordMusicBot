const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

// 명령어 파일 읽기
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('명령어 파일 목록:', commandFiles);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.data.toJSON) {
    commands.push(command.data.toJSON());
  } else {
    console.error(`명령어 파일 '${file}'에 'data' 또는 'toJSON'이 올바르지 않습니다.`);
  }
}

// REST API를 통해 각 서버에 명령어 등록
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('슬래시 명령어 등록 시작...');
    for (const guild of guildId) {
      console.log(`서버 ${guild}에 명령어 등록 중...`);
      await rest.put(
        Routes.applicationGuildCommands(clientId, guild),
        { body: commands }
      );
      console.log(`서버 ${guild}에 명령어 등록 완료.`);
    }
    console.log('모든 서버에 슬래시 명령어 등록 완료!');
  } catch (error) {
    console.error('슬래시 명령어 등록 중 오류 발생:', error);
  }
})();
