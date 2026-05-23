import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isAudioMuted,
  setAudioMuted,
  playClick,
  playHover,
  playWhoosh,
  playCheatUnlock,
  playSaveSynth,
} from './audio';

describe('Retro Audio Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    // Default to unmuted
    setAudioMuted(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default mute value', () => {
    expect(isAudioMuted()).toBe(false);
  });

  it('should toggle and persist mute state', () => {
    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);
    expect(localStorage.getItem('sound_engine_muted')).toBe('true');

    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);
    expect(localStorage.getItem('sound_engine_muted')).toBe('false');
  });

  it('should call Web Audio API functions when playClick is executed', async () => {
    const audioContextSpy = vi.spyOn(window, 'AudioContext');
    await playClick();
    expect(isAudioMuted()).toBe(false);
    // Since playClick invokes getAudioContext which instantiates AudioContext
    expect(audioContextSpy).toHaveBeenCalled();
  });

  it('should not call Web Audio API if muted', async () => {
    const audioContextSpy = vi.spyOn(window, 'AudioContext');
    setAudioMuted(true);
    await playClick();
    expect(audioContextSpy).not.toHaveBeenCalled();
  });

  it('should execute playHover, playWhoosh, playCheatUnlock, and playSaveSynth without errors', async () => {
    await expect(playHover()).resolves.toBeUndefined();
    await expect(playWhoosh()).resolves.toBeUndefined();
    await expect(playCheatUnlock()).resolves.toBeUndefined();
    await expect(playSaveSynth()).resolves.toBeUndefined();
  });
});
