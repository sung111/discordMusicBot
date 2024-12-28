const { SlashCommandBuilder } = require('discord.js');
const queue = require('../utils/queue'); // queue 가져오기
const ytdl = require('ytdl-core'); // 노래 제목 가져오기 위해 사용

module.exports = {
  data: new SlashCommandBuilder()
    .setName('대기열')
    .setDescription('현재 대기열 상태를 확인합니다.'),
  async execute(interaction) {
    try {
      // 대기열 비어있는지 확인
      if (!Array.isArray(queue) || queue.length === 0) {
        return await interaction.reply('현재 대기열에 음악이 없습니다.');
      }

      // 대기열 노래 제목 가져오기
      const queueList = await Promise.all(
        queue.map(async (track, index) => {
          const info = await ytdl.getBasicInfo(track.url);
          const title = info.videoDetails.title;
          return `${index + 1}. ${title}`;
        })
      );

      const responseMessage = `현재 대기열:\n${queueList.join('\n')}`;
      await interaction.reply(responseMessage);
    } catch (error) {
      console.error('대기열.js 실행 중 오류 발생:', error);
      await interaction.reply('대기열을 확인하는 중 문제가 발생했습니다.');
    }
  },
};
