const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = function connection(interaction) { 
  try {
    // 사용자가 음성 채널에 연결되어 있는지 확인
    if (!interaction.member.voice.channel) {
      throw new Error('User is not connected to a voice channel.');
    }

    // 음성 채널 연결 생성
    return joinVoiceChannel({
      channelId: interaction.member.voice.channel.id, 
      guildId: interaction.member.voice.channel.guild.id, 
      adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: true,
    });
  } catch (error) {
    console.error('Failed to join voice channel:', error.message);
    throw error; // 오류를 호출한 곳으로 다시 전달
  }
};
