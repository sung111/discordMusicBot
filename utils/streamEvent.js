const stream = require('./stream.js');
const queue = require('./queue.js'); // queue 가져오기

module.exports = function event(interaction) {
  player.on('stateChange', async (oldState, newState) => {
    if (oldState.status === 'playing' && newState.status === 'idle') {
      if (queue.length > 1) {
        queue.shift();
        console.log('다음 트랙으로 이동 중:', queue[0].url);

        stream(interaction, queue[0].url, ({ player, connection }) => {
          queue[0].player = player;
          queue[0].connection = connection;
        });

        await interaction.followUp('다음 음악이 재생됩니다.');
      } else {
        console.log('대기열이 비었습니다. 연결 종료 중...');
        if (queue[0] && queue[0].connection) {
          queue[0].connection.destroy(); // 음성 채널 연결 종료
        }
        queue.length = 0; // 대기열 초기화
        await interaction.followUp('모든 음악이 종료되었습니다. 봇이 음성 채널에서 퇴장합니다.');
      }
    }
  });
};
