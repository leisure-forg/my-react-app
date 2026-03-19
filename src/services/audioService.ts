// Global Audio Service - persists across screen navigation
import { type Song, type LyricLine } from '../types/music';
import { getSingleSongUrl, getLyric, getCurrentLyricLine, formatDuration } from './musicApi';

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentSong: Song | null = null;
  private currentLyrics: LyricLine[] = [];
  private isPlaying: boolean = false;
  private progress: number = 0;
  private currentTime: number = 0;

  // Event listeners
  private onTimeUpdateListeners: Array<(time: number, progress: number) => void> = [];
  private onEndedListeners: Array<() => void> = [];
  private onPlayPauseListeners: Array<(isPlaying: boolean) => void> = [];
  private onSongChangeListeners: Array<(song: Song | null) => void> = [];
  private onLyricChangeListeners: Array<(lyric: LyricLine | null) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    const audio = this.audio;

    audio.addEventListener('timeupdate', () => {
      const currentTimeMs = audio.currentTime * 1000;
      this.currentTime = currentTimeMs;

      if (this.currentSong) {
        const progress = (currentTimeMs / this.currentSong.duration) * 100;
        this.progress = progress;

        // Update current lyric
        const currentLyric = getCurrentLyricLine(this.currentLyrics, currentTimeMs);
        this.notifyLyricChange(currentLyric);
      }

      this.notifyTimeUpdate(currentTimeMs, this.progress);
    });

    audio.addEventListener('ended', () => {
      this.notifyEnded();
    });

    audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyPlayPause(true);
    });

    audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyPlayPause(false);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (this.isPlaying) {
        audio.play().catch(console.error);
      }
    });
  }

  // Event listener management
  onTimeUpdate(callback: (time: number, progress: number) => void) {
    this.onTimeUpdateListeners.push(callback);
    return () => {
      this.onTimeUpdateListeners = this.onTimeUpdateListeners.filter(cb => cb !== callback);
    };
  }

  onEnded(callback: () => void) {
    this.onEndedListeners.push(callback);
    return () => {
      this.onEndedListeners = this.onEndedListeners = this.onEndedListeners.filter(cb => cb !== callback);
    };
  }

  onPlayPause(callback: (isPlaying: boolean) => void) {
    this.onPlayPauseListeners.push(callback);
    return () => {
      this.onPlayPauseListeners = this.onPlayPauseListeners.filter(cb => cb !== callback);
    };
  }

  onSongChange(callback: (song: Song | null) => void) {
    this.onSongChangeListeners.push(callback);
    return () => {
      this.onSongChangeListeners = this.onSongChangeListeners.filter(cb => cb !== callback);
    };
  }

  onLyricChange(callback: (lyric: LyricLine | null) => void) {
    this.onLyricChangeListeners.push(callback);
    return () => {
      this.onLyricChangeListeners = this.onLyricChangeListeners.filter(cb => cb !== callback);
    };
  }

  private notifyTimeUpdate(time: number, progress: number) {
    this.onTimeUpdateListeners.forEach(cb => cb(time, progress));
  }

  private notifyEnded() {
    this.onEndedListeners.forEach(cb => cb());
  }

  private notifyPlayPause(playing: boolean) {
    this.onPlayPauseListeners.forEach(cb => cb(playing));
  }

  private notifySongChange(song: Song | null) {
    this.onSongChangeListeners.forEach(cb => cb(song));
  }

  private notifyLyricChange(lyric: LyricLine | null) {
    this.onLyricChangeListeners.forEach(cb => cb(lyric));
  }

  // Public methods
  async playSong(song: Song, playlist?: Song[], autoPlay: boolean = true) {
    this.currentSong = song;
    this.progress = 0;
    this.currentTime = 0;

    this.notifySongChange(song);

    // Load lyrics
    try {
      this.currentLyrics = await getLyric(song.id);
    } catch (error) {
      console.error('Failed to load lyrics:', error);
      this.currentLyrics = [];
    }

    // Load song URL
    try {
      const url = await getSingleSongUrl(song.id);
      if (url && this.audio) {
        this.audio.src = url;
        this.audio.load();
        if (autoPlay) {
          this.isPlaying = true;
          await this.audio.play();
        } else {
          this.isPlaying = false;
        }
      }
    } catch (error) {
      console.error('Failed to load song URL:', error);
    }
  }

  // Set current song without playing (for restoring state)
  async setCurrentSong(song: Song, playlist?: Song[]) {
    this.currentSong = song;
    this.progress = 0;
    this.currentTime = 0;
    this.isPlaying = false;

    this.notifySongChange(song);

    // Load lyrics
    try {
      this.currentLyrics = await getLyric(song.id);
    } catch (error) {
      console.error('Failed to load lyrics:', error);
      this.currentLyrics = [];
    }

    // Preload song URL but don't play
    try {
      const url = await getSingleSongUrl(song.id);
      if (url && this.audio) {
        this.audio.src = url;
        this.audio.load();
      }
    } catch (error) {
      console.error('Failed to load song URL:', error);
    }
  }

  setCurrentLyrics(lyrics: LyricLine[]) {
    this.currentLyrics = lyrics;
  }

  togglePlayPause() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(console.error);
    }
  }

  seekTo(time: number) {
    if (!this.audio) return;
    this.audio.currentTime = time / 1000; // Convert ms to seconds
  }

  setVolume(volume: number) {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  getCurrentSong(): Song | null {
    return this.currentSong;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getProgress(): { current: number; total: number; percent: number } {
    return {
      current: this.currentTime,
      total: this.currentSong?.duration || 0,
      percent: this.progress,
    };
  }

  getCurrentLyrics(): LyricLine[] {
    return this.currentLyrics;
  }

  getCurrentLyric(): LyricLine | null {
    return getCurrentLyricLine(this.currentLyrics, this.currentTime);
  }

  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.currentSong = null;
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
    this.currentLyrics = [];
    this.onTimeUpdateListeners = [];
    this.onEndedListeners = [];
    this.onPlayPauseListeners = [];
    this.onSongChangeListeners = [];
    this.onLyricChangeListeners = [];
  }
}

// Singleton instance
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

export function cleanupAudioService() {
  if (audioServiceInstance) {
    audioServiceInstance.cleanup();
    audioServiceInstance = null;
  }
}
