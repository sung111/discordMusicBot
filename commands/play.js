const { SlashCommandBuilder } = require('discord.js');
const queue = require('../utils/queue'); // queue 가져오기
const stream = require('../utils/stream'); // stream.js 가져오기

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('음악을 재생합니다.')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('재생할 유튜브 링크를 입력하세요.')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!interaction.member.voice.channel) {
        return await interaction.reply('음성 채널에 접속해주세요.');
      }

      const url = interaction.options.getString('url');

      // **Queue 상태 확인 및 초기화**
      if (!Array.isArray(queue)) {
        queue.length = 0; // Queue 초기화
      }

      console.log('Queue 상태:', queue);

      // 대기열에 URL 추가
      queue.push({ url });
      console.log('현재 대기열 상태:', queue);

      // **봇이 음성 채널에 연결되어 있는지 확인**
      const isBotConnected = queue.length > 1 && queue[0]?.connection;

      if (!isBotConnected) {
        console.log('봇이 음성 채널에 연결되어 있지 않습니다. 새로운 연결을 생성합니다.');
        await interaction.reply(`음악을 재생합니다: ${url}`);

        // 새로 추가된 트랙을 즉시 재생
        stream(interaction, url, ({ player, connection }) => {
          queue[0].player = player;
          queue[0].connection = connection;
        });
      } else if (queue.length > 1) {
        // 대기열에 추가
        await interaction.reply(`음악이 대기열에 추가되었습니다: ${url}`);
      }
    } catch (error) {
      console.error('play.js 실행 중 오류 발생:', error);
      await interaction.reply('음악 재생 중 문제가 발생했습니다.');
    }
  },
};
