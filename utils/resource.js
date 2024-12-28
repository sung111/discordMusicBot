const { createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = function resource(url) {
  try {
    // URL 유효성 검사
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    // createAudioResource를 생성하고 반환
    return createAudioResource(
      ytdl(url, {
        highWaterMark: 1 << 25, // 스트리밍 버퍼 크기
        quality: 'highestaudio', // 가장 높은 품질의 오디오
        filter: 'audioonly', // 오디오만 가져옴
      }),
      {
        inputType: StreamType.Arbitrary, // 스트림 타입 설정
      }
    );
  } catch (error) {
    console.error('Failed to create audio resource:', error.message);
    throw error; // 에러를 호출한 곳으로 다시 던짐
  }
};
