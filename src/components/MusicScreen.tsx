import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Heart,
  Shuffle,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  ListMusic,
  LogOut,
  LogIn,
  X,
  Search,
  Home,
  Disc,
  Music,
  ChevronDown,
  ChevronUp,
  Volume2,
  Loader2,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getLoginKey,
  createQRCode,
  refreshQRCode,
  pollLoginStatus,
  isLoggedIn,
  clearCookie,
  getLikelist,
  getSongDetail,
  getLikedSongs,
  searchSongs,
  formatDuration,
  toSong,
  likeSong,
  toggleLikeSong,
  getSingleSongUrl,
  type Song,
  type LyricLine,
} from '../services/musicApi';
import { getAudioService } from '../services/audioService';

type LoginState = 'idle' | 'loading' | 'show_qr' | 'scanning' | 'success' | 'expired';
type ViewMode = 'home' | 'playlists' | 'player' | 'search';
type PlayerMode = 'mini' | 'full';

interface Playlist {
  id: string;
  name: string;
  cover: string;
  songCount: number;
}

export const MusicScreen: React.FC = () => {
  // Login state
  const [loginState, setLoginState] = useState<LoginState>(isLoggedIn() ? 'success' : 'idle');
  const [qrImage, setQrImage] = useState<string>('');
  const [loginKey, setLoginKey] = useState<string>('');

  // Data state
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set());
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [currentLyrics, setCurrentLyrics] = useState<LyricLine[]>([]);
  const [currentLyricLine, setCurrentLyricLine] = useState<LyricLine | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('mini');
  const [lyricsViewMode, setLyricsViewMode] = useState<'normal' | 'immersive'>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get global audio service
  const audioService = getAudioService();

  // Separate playing playlist state (persists across views)
  const [playingPlaylist, setPlayingPlaylist] = useState<Song[]>([]);

  // Track if we're on the music screen (for auto-loading liked songs)
  const isMusicScreenActive = useRef(true);

  // Save and restore playback state
  const savePlaybackState = useCallback((song: Song, index: number, playlist: Song[]) => {
    try {
      localStorage.setItem('music-current-song', JSON.stringify(song));
      localStorage.setItem('music-current-index', index.toString());
      localStorage.setItem('music-playing-playlist', JSON.stringify(playlist));
    } catch (e) {
      console.error('Failed to save playback state:', e);
    }
  }, []);

  const restorePlaybackState = useCallback(() => {
    try {
      const savedSong = localStorage.getItem('music-current-song');
      const savedIndex = localStorage.getItem('music-current-index');
      const savedPlaylist = localStorage.getItem('music-playing-playlist');

      if (savedSong && savedPlaylist) {
        const song = JSON.parse(savedSong);
        const index = parseInt(savedIndex || '0');
        const playlist: Song[] = JSON.parse(savedPlaylist);

        setPlayingPlaylist(playlist);
        setCurrentSongIndex(index);

        // Sync with audio service but don't auto-play
        audioService.setCurrentSong(song, playlist);
        audioService.setCurrentLyrics([]);

        return { song, index, playlist };
      }
    } catch (e) {
      console.error('Failed to restore playback state:', e);
    }
    return null;
  }, [audioService]);

  // Get current playlist based on view
  // - search mode: use search results
  // - playlists mode: use liked songs
  // - home mode: use liked songs if available, otherwise empty
  const currentPlaylist =
    viewMode === 'search' ? searchResults :
    viewMode === 'playlists' ? likedSongs :
    likedSongs.length > 0 ? likedSongs : [];

  const currentSong = playingPlaylist.length > 0 ? playingPlaylist[currentSongIndex] || null : currentPlaylist[currentSongIndex] || null;

  // Store stop polling function
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [stopPolling]);

  // Load liked songs on mount and when logged in
  useEffect(() => {
    if (isLoggedIn()) {
      loadLikedSongs();
    }
    // Also try to restore playback state
    restorePlaybackState();
  }, [loginState]);

  // Load liked songs when switching to playlists view
  useEffect(() => {
    if (isLoggedIn() && viewMode === 'playlists') {
      loadLikedSongs();
    }
  }, [viewMode]);

  // Setup audio service event listeners (only once)
  useEffect(() => {
    // Subscribe to audio service events
    const unsubscribeTimeUpdate = audioService.onTimeUpdate((time, progress) => {
      setCurrentTime(time);
      setProgress(progress);
    });

    const unsubscribeEnded = audioService.onEnded(() => {
      // Auto play next song
      const playlist = playingPlaylist.length > 0 ? playingPlaylist : currentPlaylist;
      if (playlist.length > 0) {
        const nextIndex = (currentSongIndex + 1) % playlist.length;
        setCurrentSongIndex(nextIndex);
      }
    });

    const unsubscribePlayPause = audioService.onPlayPause((playing) => {
      setIsPlaying(playing);
    });

    const unsubscribeSongChange = audioService.onSongChange((song) => {
      if (song) {
        setCurrentLyrics(audioService.getCurrentLyrics());
        setCurrentSongIndex(playingPlaylist.findIndex(s => s.id === song.id) ?? 0);
      }
    });

    const unsubscribeLyricChange = audioService.onLyricChange((lyric) => {
      setCurrentLyricLine(lyric);
    });

    // Cleanup
    return () => {
      unsubscribeTimeUpdate();
      unsubscribeEnded();
      unsubscribePlayPause();
      unsubscribeSongChange();
      unsubscribeLyricChange();
    };
  }, [playingPlaylist, currentPlaylist, currentSongIndex]);

  // Sync current song state with audio service when song index changes
  // Only load the song, don't auto-play
  useEffect(() => {
    const song = playingPlaylist.length > 0 ? playingPlaylist[currentSongIndex] : currentPlaylist[currentSongIndex];
    if (song && song !== audioService.getCurrentSong()) {
      // Only load the song without auto-playing
      audioService.playSong(song, playingPlaylist.length > 0 ? playingPlaylist : undefined, false);
    }
  }, [currentSongIndex, playingPlaylist, currentPlaylist]);

  // Load liked songs
  const loadLikedSongs = async () => {
    setIsLoading(true);
    try {
      const songs = await getLikedSongs();
      setLikedSongs(songs);
      // Store liked song IDs for quick lookup
      setLikedSongIds(new Set(songs.map(s => s.id)));
      // Initialize playing playlist with liked songs if empty
      if (songs.length > 0 && playingPlaylist.length === 0) {
        setPlayingPlaylist(songs);
        setCurrentSongIndex(0);
        // Don't auto-play, just set up the playlist
      }
    } catch (error) {
      console.error('Failed to load liked songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle like/unlike song
  const handleToggleLike = async (songId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent playing the song when clicking like
    try {
      const isNowLiked = await toggleLikeSong(songId, likedSongIds.has(songId));
      const newLikedIds = new Set(likedSongIds);
      if (isNowLiked) {
        newLikedIds.add(songId);
      } else {
        newLikedIds.delete(songId);
      }
      setLikedSongIds(newLikedIds);
      // Reload liked songs list if we're in playlists view
      if (viewMode === 'playlists') {
        loadLikedSongs();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Handle download song
  const handleDownload = async (song: Song, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent playing the song when clicking download
    try {
      const url = await getSingleSongUrl(song.id);
      if (url) {
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title} - ${song.artist}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error('Failed to get song URL for download');
      }
    } catch (error) {
      console.error('Failed to download song:', error);
    }
  };

  // Search songs (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim()) {
        setIsLoading(true);
        try {
          const results = await searchSongs(searchInput);
          setSearchResults(results);
          setViewMode('search');
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (viewMode === 'search') {
        setViewMode('home');
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Start login process
  const handleLogin = async () => {
    setLoginState('loading');
    setShowLoginModal(true);

    try {
      const key = await getLoginKey();
      const qrData = await createQRCode(key);
      setQrImage(qrData);
      setLoginKey(key);
      setLoginState('show_qr');

      const stopFn = pollLoginStatus(
        key,
        () => {
          // Login success - immediately close modal and load data
          setLoginState('success');
          setShowLoginModal(false);
          loadLikedSongs();
        },
        (error) => {
          setLoginState('expired');
          console.error(error);
        }
      );
      setStopPolling(() => stopFn);
    } catch (error) {
      setLoginState('idle');
      console.error('Login error:', error);
    }
  };

  // Refresh QR code - generates new key and QR code
  const handleRefreshQR = async () => {
    setLoginState('loading');
    setQrImage('');

    // Stop existing polling
    if (stopPolling) {
      stopPolling();
      setStopPolling(null);
    }

    try {
      const { key, qrImage } = await refreshQRCode();
      setLoginKey(key);
      setQrImage(qrImage);
      setLoginState('show_qr');

      // Start new polling with new key
      const stopFn = pollLoginStatus(
        key,
        () => {
          setLoginState('success');
          setShowLoginModal(false);
          loadLikedSongs();
        },
        (error) => {
          setLoginState('expired');
          console.error(error);
        }
      );
      setStopPolling(() => stopFn);
    } catch (error) {
      setLoginState('idle');
      console.error('Refresh QR error:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearCookie();
    setLoginState('idle');
    setLikedSongs([]);
    setPlayingPlaylist([]);
    setQrImage('');
    setLoginKey('');
    setCurrentSongIndex(0);
    setIsPlaying(false);
    if (stopPolling) {
      stopPolling();
      setStopPolling(null);
    }
  };

  // Close QR modal
  const handleCloseQR = () => {
    setShowLoginModal(false);
    setLoginState('idle');
    setQrImage('');
    setLoginKey('');
    if (stopPolling) {
      stopPolling();
      setStopPolling(null);
    }
  };

  // Playback controls
  const handlePlayPause = () => {
    audioService.togglePlayPause();
  };

  // Use playingPlaylist for navigation (persists across views)
  const actualPlaylist = playingPlaylist.length > 0 ? playingPlaylist : currentPlaylist;

  const handlePrevious = () => {
    if (actualPlaylist.length === 0) return;
    const newIndex = (currentSongIndex > 0 ? currentSongIndex - 1 : actualPlaylist.length - 1);
    setCurrentSongIndex(newIndex);
    const song = actualPlaylist[newIndex];
    if (song) {
      audioService.playSong(song, playingPlaylist.length > 0 ? playingPlaylist : undefined);
    }
  };

  const handleNext = () => {
    if (actualPlaylist.length === 0) return;
    const newIndex = (currentSongIndex < actualPlaylist.length - 1 ? currentSongIndex + 1 : 0);
    setCurrentSongIndex(newIndex);
    const song = actualPlaylist[newIndex];
    if (song) {
      audioService.playSong(song, playingPlaylist.length > 0 ? playingPlaylist : undefined);
    }
  };

  const handleSongSelect = (index: number) => {
    // Update the playing playlist to match current view's playlist
    const newPlaylist = [...currentPlaylist];
    const song = newPlaylist[index];

    setPlayingPlaylist(newPlaylist);
    setCurrentSongIndex(index);

    // Save to localStorage
    savePlaybackState(song, index, newPlaylist);

    // Load the song but don't auto-play
    audioService.playSong(song, newPlaylist, false); // false = don't auto-play
  };

  // Handle song select from search results (need to preserve the search results)
  const handleSearchResultSelect = (index: number) => {
    // Keep search results as the playing playlist when playing from search
    const newPlaylist = [...searchResults];
    setPlayingPlaylist(newPlaylist);
    setCurrentSongIndex(index);

    // Save to localStorage
    const song = newPlaylist[index];
    savePlaybackState(song, index, newPlaylist);

    // Load the song but don't auto-play
    audioService.playSong(song, newPlaylist, false); // false = don't auto-play

    // Don't clear search results when playing - switch to player view
    setViewMode('player');
  };

  // Render Home View
  const renderHomeView = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 hide-scrollbar">
      <h2 className="text-xl font-bold mb-4">推荐</h2>

      {isLoggedIn() ? (
        <div className="mb-6">
          <div
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl"
            onClick={() => setViewMode('playlists')}
          >
            <div className="w-16 h-16 rounded-xl bg-primary/30 flex items-center justify-center">
              <Heart className="size-8 fill-primary text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold">我喜欢的音乐</p>
              <p className="text-sm opacity-60">{likedSongs.length}首</p>
            </div>
            <ChevronDown className="size-5 opacity-50" />
          </div>
        </div>
      ) : (
        <div
          className="mb-6 flex items-center gap-3 p-4 bg-surface/20 rounded-2xl"
          onClick={handleLogin}
        >
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
            <LogIn className="size-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold">登录查看我的歌单</p>
            <p className="text-sm opacity-60">登录后同步收藏</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">最近播放</h2>
      <div className="space-y-2">
        {currentPlaylist.slice(0, 5).map((song, index) => (
          <motion.div
            key={song.id}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              currentSong?.id === song.id ? 'bg-primary/20' : 'bg-surface/20'
            }`}
            onClick={() => handleSongSelect(index)}
          >
            <img src={song.albumCover} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{song.title}</p>
              <p className="text-xs opacity-50 truncate">{song.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleToggleLike(song.id, e)}
                className={`p-2 rounded-full transition-colors ${
                  likedSongIds.has(song.id) ? 'text-primary' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Heart className={`size-4 ${likedSongIds.has(song.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => handleDownload(song, e)}
                className="p-2 text-white/30 hover:text-white/60 rounded-full transition-colors"
              >
                <Download className="size-4" />
              </button>
            </div>
            {currentSong?.id === song.id && isPlaying && (
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                <div className="w-0.5 h-4 bg-primary rounded-full animate-pulse delay-75" />
                <div className="w-0.5 h-2 bg-primary rounded-full animate-pulse delay-150" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render Playlists View
  const renderPlaylistsView = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 hide-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我喜欢的音乐</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : isLoggedIn() && likedSongs.length > 0 ? (
        <div className="space-y-2">
          {likedSongs.map((song, index) => (
            <motion.div
              key={song.id}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                currentSong?.id === song.id ? 'bg-primary/20' : 'bg-surface/20'
              }`}
              onClick={() => handleSongSelect(index)}
            >
              <img src={song.albumCover} alt={song.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm opacity-50 truncate">{song.artist}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleToggleLike(song.id, e)}
                  className="p-2 text-primary rounded-full transition-colors"
                >
                  <Heart className="size-4 fill-current" />
                </button>
                <button
                  onClick={(e) => handleDownload(song, e)}
                  className="p-2 text-white/30 hover:text-white/60 rounded-full transition-colors"
                >
                  <Download className="size-4" />
                </button>
              </div>
              <span className="text-xs opacity-40">{song.durationFormatted}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music className="size-16 mx-auto mb-4 opacity-30" />
          <p className="opacity-50 mb-4">登录后查看您的歌单</p>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-primary text-white rounded-full"
          >
            立即登录
          </button>
        </div>
      )}
    </div>
  );

  // Render Search Results View
  const renderSearchView = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 hide-scrollbar">
      <h2 className="text-xl font-bold mb-4">
        搜索 "{searchInput}"
        {searchResults.length > 0 && <span className="opacity-50 text-lg ml-2">({searchResults.length})</span>}
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2">
          {searchResults.map((song, index) => (
            <motion.div
              key={song.id}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                currentSong?.id === song.id ? 'bg-primary/20' : 'bg-surface/20'
              }`}
              onClick={() => handleSearchResultSelect(index)}
            >
              <img src={song.albumCover} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs opacity-50 truncate">{song.artist}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleToggleLike(song.id, e)}
                  className={`p-2 rounded-full transition-colors ${
                    likedSongIds.has(song.id) ? 'text-primary' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  <Heart className={`size-4 ${likedSongIds.has(song.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDownload(song, e)}
                  className="p-2 text-white/30 hover:text-white/60 rounded-full transition-colors"
                >
                  <Download className="size-4" />
                </button>
              </div>
              <span className="text-xs opacity-40">{song.durationFormatted}</span>
            </motion.div>
          ))}
        </div>
      ) : searchInput ? (
        <div className="text-center py-12 opacity-50">
          <p>未找到相关歌曲</p>
        </div>
      ) : null}
    </div>
  );

  // Render Player View
  const renderPlayerView = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto hide-scrollbar">
      {!currentSong ? (
        <div className="flex-1 flex items-center justify-center opacity-50">
          <div className="text-center">
            <Music className="size-16 mx-auto mb-4" />
            <p>选择一首歌曲开始播放</p>
          </div>
        </div>
      ) : lyricsViewMode === 'immersive' ? (
        // Immersive Lyrics View - Full screen lyrics
        <div className="flex-1 flex flex-col w-full max-w-lg h-full">
          {/* Song Info Header */}
          <div className="text-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
            <p className="text-primary/80 text-sm mt-1 truncate">{currentSong.artist}</p>
          </div>

          {/* Scrollable Lyrics */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-4">
            {currentLyrics.length > 0 ? (
              <div className="flex flex-col gap-4 py-4">
                {currentLyrics.map((line, index) => {
                  const isCurrentLine = currentLyricLine?.time === line.time;
                  const isPast = currentLyricLine && line.time < currentLyricLine.time;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: isPast ? 0.3 : isCurrentLine ? 1 : 0.6,
                        scale: isCurrentLine ? 1.05 : 1,
                        y: 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`text-center py-2 px-4 rounded-lg transition-all ${
                        isCurrentLine
                          ? 'text-xl font-bold text-primary bg-primary/10'
                          : isPast
                          ? 'text-sm text-white/30'
                          : 'text-base text-white/60'
                      }`}
                    >
                      {line.text}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center opacity-50 py-12">
                <p>暂无歌词</p>
              </div>
            )}
          </div>

          {/* Exit Immersive Button */}
          <button
            onClick={() => setLyricsViewMode('normal')}
            className="mt-4 text-sm text-white/50 hover:text-white/80 flex items-center gap-2 justify-center flex-shrink-0 pb-24"
          >
            <ChevronDown className="size-4" />
            返回唱片
          </button>
        </div>
      ) : (
        // Normal Player View - Album + Lyrics below
        <>
          {/* Album Art - Click to enter immersive lyrics */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="size-48 md:size-56 rounded-full bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_0_8px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden border-[4px] border-[#1a1a1a] mb-6 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
            onClick={() => currentLyrics.length > 0 && setLyricsViewMode('immersive')}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-radial-gradient(circle, #333 0, #333 1px, transparent 1px, transparent 4px)' }}></div>
            <div className="size-28 md:size-36 rounded-full overflow-hidden border-3 border-[#121212] z-10">
              <img src={currentSong.albumCover} alt={currentSong.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="size-3 bg-background-dark rounded-full border border-white/20"></div>
            </div>
            {/* Lyrics hint overlay */}
            {currentLyrics.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                <div className="text-center text-white">
                  <Music className="size-8 mx-auto mb-1" />
                  <p className="text-sm">点击查看完整歌词</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Song Info */}
          <div className="text-center mb-4 w-full px-4">
            <h2 className="text-xl md:text-2xl font-bold truncate">{currentSong.title}</h2>
            <p className="text-primary opacity-80 mt-1 truncate">{currentSong.artist}</p>
          </div>

          {/* Lyrics Preview Below Album */}
          {currentLyrics.length > 0 ? (
            <div className="w-full max-w-md px-4 mb-4">
              <div className="flex flex-col items-center gap-2 max-h-40 overflow-hidden">
                {(() => {
                  const currentIndex = currentLyrics.findIndex(l => l.time === currentLyricLine?.time);
                  const startIndex = Math.max(0, currentIndex - 1);
                  const endIndex = Math.min(currentLyrics.length, currentIndex + 4);
                  const visibleLines = currentLyrics.slice(startIndex, endIndex);

                  return visibleLines.map((line, idx) => {
                    const isCurrentLine = currentLyricLine?.time === line.time;
                    const isPast = currentLyricLine && line.time < currentLyricLine.time;

                    return (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: isPast ? 0.4 : isCurrentLine ? 1 : 0.7,
                          scale: isCurrentLine ? 1.05 : 1,
                          y: 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`text-center transition-all cursor-pointer ${
                          isCurrentLine
                            ? 'text-base md:text-lg font-semibold text-primary'
                            : isPast
                            ? 'text-xs text-white/40'
                            : 'text-sm text-white/70'
                        }`}
                        onClick={() => setLyricsViewMode('immersive')}
                      >
                        {line.text}
                      </motion.p>
                    );
                  });
                })()}
              </div>
              <button
                onClick={() => setLyricsViewMode('immersive')}
                className="text-sm text-white/50 hover:text-white/80 flex items-center gap-1 mt-3 mx-auto"
              >
                <ListMusic className="size-4" />
                查看完整歌词
              </button>
            </div>
          ) : (
            <div className="text-center opacity-40 mb-4">
              <p className="text-sm">♪ ♪ ♪</p>
              <p className="text-xs mt-1">暂无歌词</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-hidden relative">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center blur-[60px] brightness-[0.3] scale-125"
        style={{ backgroundImage: currentSong ? `url(${currentSong.albumCover})` : undefined }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-0"></div>

      {/* Header - Search & Login */}
      <header className="relative z-20 px-4 pt-4 pb-2">
        <AnimatePresence mode="wait">
          {!showSearchBar ? (
            // Normal Header
            <motion.div
              key="normal-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between"
            >
              {/* Title */}
              <h1 className="text-xl font-bold text-white">音乐</h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Search Button */}
                <button
                  onClick={() => setShowSearchBar(true)}
                  className="p-2.5 bg-surface/30 backdrop-blur-sm rounded-full border border-white/10 hover:bg-surface/50 transition-colors"
                >
                  <Search className="size-5" />
                </button>

                {/* Login Button */}
                {isLoggedIn() ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                  >
                    已登录
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={loginState === 'loading'}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <LogIn className="size-4" />
                    登录
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // Search Bar Header
            <motion.div
              key="search-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-primary" />
                <input
                  type="text"
                  placeholder="搜索歌曲、歌手..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-4 py-2.5 bg-surface/30 backdrop-blur-sm rounded-full text-base border border-white/10 focus:border-primary/50 focus:outline-none transition-colors text-white"
                />
              </div>
              <button
                onClick={() => {
                  setShowSearchBar(false);
                  setSearchInput('');
                  setViewMode('home');
                }}
                className="p-2.5 text-white/60 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Navigation Tabs */}
      <nav className="relative z-20 px-4 py-2">
        <div className="flex gap-2">
          {[
            { id: 'home' as ViewMode, icon: Home, label: '首页' },
            { id: 'playlists' as ViewMode, icon: Disc, label: '歌单' },
            { id: 'player' as ViewMode, icon: Music, label: '播放器' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-surface/20 text-on-surface hover:bg-surface/30'
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + (viewMode === 'search' ? searchInput : '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {viewMode === 'home' && renderHomeView()}
            {viewMode === 'playlists' && renderPlaylistsView()}
            {viewMode === 'player' && renderPlayerView()}
            {viewMode === 'search' && renderSearchView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Player Bar (Mini) - Only show when playing song and not in full player mode */}
      {playerMode === 'mini' && currentSong && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="relative z-20 bg-surface/60 backdrop-blur-3xl border-t border-primary/10"
        >
          {/* Clickable area to switch to player page */}
          <div
            className="px-4 py-3 pb-28 cursor-pointer"
            onClick={() => {
              setViewMode('player');
              setPlayerMode('full');
            }}
          >
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] opacity-50">{formatDuration(currentTime)}</span>
                <span className="text-[10px] opacity-50">{currentSong.durationFormatted}</span>
              </div>
            </div>

            {/* Song Info and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={currentSong.albumCover}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{currentSong.title}</p>
                  <p className="text-xs opacity-50 truncate">{currentSong.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="p-2"
                >
                  <SkipBack className="size-5 fill-current" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                  className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="p-2"
                >
                  <SkipForward className="size-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Player Mode */}
      {playerMode === 'full' && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          className="relative z-20 bg-surface/80 backdrop-blur-3xl border-t border-primary/10"
        >
          {/* Collapse Button */}
          <div className="flex justify-center pt-3">
            <button
              onClick={() => setPlayerMode('mini')}
              className="px-4 py-1 bg-primary/90 rounded-b-xl text-white text-xs flex items-center gap-1"
            >
              <ChevronDown className="size-3" />
              收起
            </button>
          </div>

          {/* Full Player Content */}
          {viewMode === 'player' && currentSong ? (
            <div className="px-8 pb-32">
              {/* Progress */}
              <div className="mb-6">
                <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs opacity-50">{formatDuration(currentTime)}</span>
                  <span className="text-xs opacity-50">{currentSong.durationFormatted}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button className="p-3 opacity-60 hover:opacity-100 transition-opacity">
                  <Shuffle className="size-6" />
                </button>
                <button onClick={handlePrevious} className="p-3">
                  <SkipBack className="size-8 fill-current" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="size-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current ml-1" />}
                </button>
                <button onClick={handleNext} className="p-3">
                  <SkipForward className="size-8 fill-current" />
                </button>
                <button className="p-3 opacity-60 hover:opacity-100 transition-opacity">
                  <Volume2 className="size-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-8 py-4 pb-32 flex items-center justify-center">
              <button
                onClick={() => setViewMode('player')}
                className="text-primary text-sm flex items-center gap-2"
              >
                切换到播放器视图
                <Music className="size-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleCloseQR}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-surface/95 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border border-primary/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button onClick={handleCloseQR} className="absolute top-4 right-4 text-on-surface/60 hover:text-on-surface">
                <X className="size-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-primary mb-1">扫码登录</h3>
                <p className="text-on-surface/60 text-sm">请使用网易云音乐APP扫描二维码</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {qrImage ? (
                  <img src={qrImage} alt="QR Code" className="w-56 h-56 rounded-lg bg-white p-2" />
                ) : (
                  <div className="w-56 h-56 rounded-lg bg-white/10 flex items-center justify-center">
                    <div className="animate-pulse text-primary">生成中...</div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-on-surface/70">
                  {loginState === 'show_qr' && '等待扫码...'}
                  {loginState === 'scanning' && '已扫码，请在手机上确认'}
                  {loginState === 'success' && '登录成功！'}
                  {loginState === 'loading' && '正在生成二维码...'}
                </p>
              </div>

              {/* Refresh */}
              {loginState === 'show_qr' && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleRefreshQR}
                    disabled={loginState === 'loading'}
                    className="text-primary text-sm hover:underline disabled:opacity-50"
                  >
                    {loginState === 'loading' ? '刷新中...' : '刷新二维码'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
