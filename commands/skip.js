const { SlashCommandBuilder } = require('discord.js');
const queue = require('../utils/queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('현재 재생 중인 음악을 스킵합니다.'),
  async execute(interaction) {
    try {
      if (!interaction.member.voice.channel) {
        return await interaction.reply('음성 채널에 접속해주세요.');
      }

      // Queue 확인
      console.log('현재 Queue 상태:', queue);
      if (!Array.isArray(queue) || queue.length === 0) {
        return await interaction.reply('대기열에 음악이 없습니다.');
      }

      // 현재 재생 중인 음악 제거
      const currentTrack = queue.shift();
      console.log('현재 트랙 제거:', currentTrack);

      if (queue.length > 0) {
        // 다음 음악 재생
        const nextTrack = queue[0];
        console.log('다음 트랙 재생:', nextTrack.url);

        const stream = require('../utils/stream');
        stream(interaction, nextTrack.url, ({ player, connection }) => {
          queue[0].player = player;
          queue[0].connection = connection;
        });

        await interaction.reply('현재 음악을 스킵하고 다음 음악을 재생합니다.');
      } else {
        // 대기열이 비어 있을 때 플레이어와 연결 종료
        if (currentTrack.player && currentTrack.connection) {
          currentTrack.player.stop(); // 플레이어 정지
          currentTrack.connection.destroy(); // 음성 채널 연결 종료
          console.log('음악 재생 종료 및 음성 채널 연결 해제.');
        }

        await interaction.reply('현재 음악을 스킵했습니다. 대기열에 음악이 없습니다.');
      }
    } catch (error) {
      console.error('skip.js 실행 중 오류 발생:', error);
      await interaction.reply('음악 스킵 중 문제가 발생했습니다.');
    }
  },
};
