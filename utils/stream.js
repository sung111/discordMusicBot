const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { exec } = require('child_process');
const fs = require('fs');
const queue = require('./queue'); // queue 가져오기

module.exports = async function stream(interaction, url, callback) {
  try {
    console.log('사용자가 접속한 음성 채널 ID:', interaction.member.voice.channel.id);

    // 음성 채널에 연결
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    const player = createAudioPlayer();

    // yt-dlp로 파일 다운로드
    const outputPath = './temp_audio.webm';
    const command = `yt-dlp -o ${outputPath} -f bestaudio[ext=webm]/bestaudio --no-playlist ${url}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`yt-dlp 다운로드 오류: ${stderr}`);
        return interaction.followUp('음악 스트리밍 중 문제가 발생했습니다.');
      }

      console.log('다운로드 완료, 오디오 재생 시작');
      const resource = createAudioResource(outputPath);

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log('음악이 재생 중입니다.');
      });

      player.on(AudioPlayerStatus.Idle, async () => {
        console.log('음악 재생이 종료되었습니다.');

        // **다음 대기열 재생**
        queue.shift(); // 현재 재생된 음악 제거
        console.log('현재 대기열 상태:', queue);

        if (queue.length > 0) {
          console.log('다음 음악 재생:', queue[0].url);
          stream(interaction, queue[0].url, callback); // 다음 음악 재생
        } else {
          console.log('대기열이 비어 있습니다. 연결 종료.');
          connection.destroy(); // 대기열이 비어 있으면 연결 종료
          player.removeAllListeners(); // 기존 이벤트 리스너 제거
          fs.unlinkSync(outputPath); // 임시 파일 삭제
        }
      });

      player.on('error', (error) => {
        console.error('AudioPlayerError:', error.message);
      });

      if (typeof callback === 'function') {
        callback({ player, connection });
      }
    });
  } catch (error) {
    console.error('stream.js에서 에러 발생:', error.message);
    interaction.followUp('음악 스트리밍 중 문제가 발생했습니다.');
  }
};
