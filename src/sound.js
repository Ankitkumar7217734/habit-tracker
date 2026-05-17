import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let _player = null;

export async function initAudio() {
  try {
    await setAudioModeAsync({ playsInSilentModeIOS: true });
  } catch (_) {}
}

export async function playChime() {
  try {
    if (!_player) {
      _player = createAudioPlayer(require('../assets/chime.wav'));
    }
    _player.seekTo(0);
    _player.play();
  } catch (_) {}
}
