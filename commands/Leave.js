const { SlashCommandBuilder } = require('discord.js');
const queue = require('../utils/queue'); // queue 가져오기

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퇴장')
    .setDescription('음성 채널에서 봇이 퇴장합니다. 대기열도 초기화됩니다.'),
  async execute(interaction) {
    try {
      if (!interaction.member.voice.channel) {
        return await interaction.reply('음성 채널에 접속 중인 사용자가 아닙니다.');
      }

      // Queue 상태 확인
      console.log('퇴장 명령 실행 전 Queue 상태:', queue);
      if (!Array.isArray(queue) || queue.length === 0) {
        return await interaction.reply('현재 재생 중인 음악이 없으며, 봇이 음성 채널에 없습니다.');
      }

      // 현재 재생 중인 음악의 연결 해제
      const currentTrack = queue.shift();
      if (currentTrack && currentTrack.connection) {
        currentTrack.player.stop(); // 음악 재생 중단
        currentTrack.connection.destroy(); // 음성 채널 연결 종료
        console.log('음성 채널 연결 해제 및 플레이어 정지.');
      }

      // 대기열 초기화
      queue.length = 0;
      console.log('Queue 초기화 완료.');

      await interaction.reply('봇이 음성 채널에서 퇴장하였으며 대기열이 모두 삭제되었습니다.');
    } catch (error) {
      console.error('퇴장.js 실행 중 오류 발생:', error);
      await interaction.reply('퇴장 명령 실행 중 문제가 발생했습니다.');
    }
  },
};
