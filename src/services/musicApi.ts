// NetEase Cloud Music API Service
import type {
  LoginKeyResponse,
  QRCodeResponse,
  LoginCheckResponse,
  LikelistResponse,
  SongDetailResponse,
  SongDetail,
  LyricResponse,
  LyricLine,
  SearchResponse,
  SongUrlResponse,
  Song,
} from '../types/music';

const MUSIC_API_BASE_URL = import.meta.env.VITE_MUSIC_API_BASE_URL || 'https://my-react-app-90i.pages.dev';

// Storage key for cookie
const COOKIE_STORAGE_KEY = 'music_cookie';

// ==================== Helper Functions ====================

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Convert SongDetail to simplified Song type
 */
export function toSong(songDetail: SongDetail): Song {
  const artists = songDetail.ar.map((a) => a.name).join(', ');
  return {
    id: songDetail.id,
    title: songDetail.name,
    artist: artists,
    artists: songDetail.ar,
    album: songDetail.al.name,
    albumCover: songDetail.al.picUrl,
    duration: songDetail.dt,
    durationFormatted: formatDuration(songDetail.dt),
  };
}

/**
 * Build URL with timestamp
 */
function buildUrl(endpoint: string): string {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}timestamp=${Date.now()}`;
}

/**
 * Make authenticated API request (all requests are GET)
 * Uses credentials: 'include' to send cookies without triggering CORS preflight
 * All requests include timestamp parameter
 *
 * IMPORTANT: Using credentials: 'include' instead of manual Cookie header
 * - Manual Cookie header triggers OPTIONS preflight (CORS issue)
 * - credentials: 'include' lets browser handle cookies automatically (no preflight for same-origin)
 * - The cookie must be set via document.cookie for browser to send it
 */
async function apiFetch(endpoint: string): Promise<Response> {
  const cookie = localStorage.getItem(COOKIE_STORAGE_KEY);

  // Set cookie in document.cookie so browser can include it automatically
  // This is required for credentials: 'include' to work
  if (cookie) {
    // Parse cookie string to set individual cookies
    const cookiePairs = cookie.split('; ').filter(c => c.includes('='));
    cookiePairs.forEach(cookiePair => {
      const [name, value] = cookiePair.split('=');
      if (name && value) {
        // Set cookie with appropriate path
        document.cookie = `${name}=${value}; path=/`;
      }
    });
    console.log(`API Request [${endpoint}]: Cookies set via document.cookie`);
  } else {
    console.log(`API Request [${endpoint}]: No cookie found in localStorage`);
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  const url = buildUrl(endpoint);

  // Using credentials: 'include' to include cookies automatically
  // This avoids triggering CORS preflight for Cookie header
  return fetch(`${MUSIC_API_BASE_URL}${url}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
}

// ==================== Login APIs ====================

/**
 * Get login QR key
 * GET /login/qr/key
 */
export async function getLoginKey(): Promise<string> {
  const response = await apiFetch('/login/qr/key');
  const data: LoginKeyResponse = await response.json();

  if (data.code === 200 && data.data.unikey) {
    return data.data.unikey;
  }

  throw new Error('Failed to get login key');
}

/**
 * Create login QR code
 * GET /login/qr/create?key=xxx&qrimg=true
 */
export async function createQRCode(key: string): Promise<string> {
  const response = await apiFetch(`/login/qr/create?key=${key}&qrimg=true`);
  const data: QRCodeResponse = await response.json();

  if (data.code === 200 && data.data.qrimg) {
    return data.data.qrimg;
  }

  throw new Error('Failed to create QR code');
}

/**
 * Refresh QR code - generates new key and QR code
 */
export async function refreshQRCode(): Promise<{ key: string; qrImage: string }> {
  const key = await getLoginKey();
  const qrImage = await createQRCode(key);
  return { key, qrImage };
}

/**
 * Check login status
 * GET /login/qr/check?key=xxx
 */
export async function checkLoginStatus(key: string): Promise<{ code: number; message?: string; cookie?: string }> {
  const response = await apiFetch(`/login/qr/check?key=${key}`);
  const data: LoginCheckResponse = await response.json();

  return {
    code: data.code,
    message: data.message,
    cookie: data.cookie,
  };
}

/**
 * Poll login status with interval
 * Returns stop function and current key for refresh
 */
export function pollLoginStatus(
  key: string,
  onSuccess: () => void,  // Changed: no longer passes cookie
  onError?: (error: string) => void,
  interval: number = 2000
): () => void {
  let stopped = false;

  const poll = async () => {
    if (stopped) return;

    try {
      const result = await checkLoginStatus(key);

      if (result.code === 803) {
        // Login success
        stopped = true;
        if (result.cookie) {
          saveCookie(result.cookie);
        }
        onSuccess();  // Call success callback (will close modal)
      } else if (result.code === 800) {
        // QR code expired
        stopped = true;
        onError?.('QR code expired, please try again');
      } else if (result.code === 801) {
        // Waiting for scan
        console.log('Waiting for scan...');
      } else if (result.code === 802) {
        // Scanned, waiting for confirmation
        console.log('Scanned, waiting for confirmation...');
      }
    } catch (error) {
      stopped = true;
      onError?.('Network error, please try again');
    }

    if (!stopped) {
      setTimeout(poll, interval);
    }
  };

  poll();

  // Return stop function
  return () => {
    stopped = true;
  };
}

// ==================== Cookie Management ====================

/**
 * Parse cookie string and extract relevant cookie name=value pairs
 * The input is in Set-Cookie format with attributes like Max-Age, Expires, Path
 * We need to extract only the cookie values for the Cookie request header
 */
function parseCookieString(cookieString: string): string {
  if (!cookieString) return '';

  console.log('Parsing cookie string, length:', cookieString.length);

  // The cookie format from login API is: name=value; attr1=val1; attr2=val2;;name2=value2; ...
  // We need to extract only specific cookies that are required for authentication
  const requiredCookies = ['MUSIC_U', '__csrf', 'NMTID'];
  const extractedCookies: string[] = [];

  // Extract cookies by name pattern
  for (const cookieName of requiredCookies) {
    // Match pattern: COOKIE_NAME=VALUE;
    // The value can contain any characters except semicolon
    const regex = new RegExp(`${cookieName}=([^;]+)`);
    const match = cookieString.match(regex);

    if (match && match[1]) {
      const value = match[1];
      // Skip empty values
      if (value !== '' && value !== 'undefined' && value !== 'null') {
        extractedCookies.push(`${cookieName}=${value}`);
        console.log(`Extracted cookie: ${cookieName}=${value.substring(0, 50)}...`);
      }
    }
  }

  // Join cookie pairs with '; ' for Cookie header format
  const result = extractedCookies.join('; ');
  console.log('Final parsed cookie:', result);
  return result;
}

/**
 * Save cookie to localStorage and document.cookie
 * Parses the Set-Cookie format and extracts relevant cookie values
 */
export function saveCookie(cookie: string): void {
  const parsedCookie = parseCookieString(cookie);
  localStorage.setItem(COOKIE_STORAGE_KEY, parsedCookie);
  console.log('Cookie saved to localStorage, length:', parsedCookie.length);

  // Also set cookies in document.cookie so browser can include them automatically
  // This is required for credentials: 'include' to work
  const cookiePairs = parsedCookie.split('; ').filter(c => c.includes('='));
  cookiePairs.forEach(cookiePair => {
    const [name, value] = cookiePair.split('=');
    if (name && value) {
      document.cookie = `${name}=${value}; path=/`;
      console.log(`Set document.cookie: ${name}=${value.substring(0, 30)}...`);
    }
  });
}

/**
 * Get cookie from localStorage
 */
export function getCookie(): string | null {
  const cookie = localStorage.getItem(COOKIE_STORAGE_KEY);
  console.log('Retrieved cookie from localStorage:', cookie ? cookie.substring(0, 100) + '...' : 'null');
  return cookie;
}

/**
 * Clear cookie from localStorage and document.cookie
 */
export function clearCookie(): void {
  localStorage.removeItem(COOKIE_STORAGE_KEY);

  // Also clear cookies from document.cookie
  const cookies = ['MUSIC_U', '__csrf', 'NMTID'];
  cookies.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });

  console.log('Cookie cleared from localStorage and document.cookie');
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  const cookie = getCookie();
  const hasMusicU = cookie?.includes('MUSIC_U=');
  console.log('isLoggedIn check:', { hasCookie: !!cookie, hasMusicU });
  return cookie !== null && cookie.length > 0 && hasMusicU;
}

// ==================== Likelist API ====================

/**
 * Get user's liked songs list
 * GET /likelist
 */
export async function getLikelist(): Promise<number[]> {
  console.log('Fetching /likelist...');
  const response = await apiFetch('/likelist');
  const data: LikelistResponse = await response.json();

  console.log('/likelist response:', { code: data.code, idsLength: data.ids?.length || 0, ids: data.ids });

  if (data.code === 200) {
    return data.ids;
  }

  console.error('Failed to get likelist, code:', data.code);
  throw new Error(`Failed to get likelist, code: ${data.code}`);
}

// ==================== Song Detail API ====================

/**
 * Get song details by IDs
 * GET /song/detail?ids=xxx,xxx
 */
export async function getSongDetail(ids: number | number[]): Promise<SongDetail[]> {
  const idsParam = Array.isArray(ids) ? ids.join(',') : ids.toString();
  const response = await apiFetch(`/song/detail?ids=${idsParam}`);
  const data: SongDetailResponse = await response.json();

  if (data.code === 200 && data.songs) {
    return data.songs;
  }

  throw new Error('Failed to get song details');
}

/**
 * Get user's liked songs with details
 */
export async function getLikedSongs(): Promise<Song[]> {
  const ids = await getLikelist();

  if (ids.length === 0) {
    return [];
  }

  // API can handle up to 300 IDs at once
  const details = await getSongDetail(ids);
  return details.map(toSong);
}

/**
 * Get song URL for playback
 * GET /song/url?id=xxx
 * Requires cookie
 */
export async function getSongUrl(id: number | number[]): Promise<Map<number, string>> {
  const idsParam = Array.isArray(id) ? id.join(',') : id.toString();
  const response = await apiFetch(`/song/url?id=${idsParam}`);
  const data: SongUrlResponse = await response.json();

  if (data.code === 200 && data.data) {
    const urlMap = new Map<number, string>();
    data.data.forEach((item) => {
      if (item.url && item.code === 200) {
        urlMap.set(item.id, item.url);
      }
    });
    return urlMap;
  }

  throw new Error('Failed to get song URL');
}

/**
 * Get single song URL for playback
 */
export async function getSingleSongUrl(id: number): Promise<string | null> {
  try {
    const urlMap = await getSongUrl(id);
    return urlMap.get(id) || null;
  } catch (error) {
    console.error('Failed to get song URL:', error);
    return null;
  }
}

// ==================== Lyric API ====================

/**
 * Parse LRC lyric string to array of lines
 */
export function parseLyric(lrc: string): LyricLine[] {
  if (!lrc) return [];

  const lines = lrc.split('\n');
  const parsed: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const text = match[4].trim();

      const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds;

      if (text) {
        parsed.push({ time, text });
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Get song lyrics
 * GET /lyric?id=xxx
 */
export async function getLyric(id: number): Promise<LyricLine[]> {
  const response = await apiFetch(`/lyric?id=${id}`);
  const data: LyricResponse = await response.json();

  if (data.code === 200 && data.lrc?.lyric) {
    return parseLyric(data.lrc.lyric);
  }

  return [];
}

/**
 * Get current lyric line based on playback time
 */
export function getCurrentLyricLine(lyrics: LyricLine[], currentTime: number): LyricLine | null {
  if (lyrics.length === 0) return null;

  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return lyrics[i];
    }
  }

  return null;
}

// ==================== Like API ====================

/**
 * Like or unlike a song
 * GET /like?id=xx&like=true (like) or /like?id=xx&like=false (unlike)
 * Requires cookie
 */
export async function likeSong(id: number, like: boolean = true): Promise<{ code: number; message?: string }> {
  const response = await apiFetch(`/like?id=${id}&like=${like}`);
  const data = await response.json();

  if (data.code === 200) {
    return { code: data.code, message: data.message };
  }

  throw new Error(`Failed to ${like ? 'like' : 'unlike'} song, code: ${data.code}`);
}

/**
 * Toggle like status for a song
 */
export async function toggleLikeSong(id: number, currentlyLiked: boolean): Promise<boolean> {
  try {
    await likeSong(id, !currentlyLiked);
    return !currentlyLiked; // Return new like status
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return currentlyLiked; // Return original status on error
  }
}

// ==================== Search API ====================

/**
 * Search songs (requires login/cookie)
 * GET /search?keywords=xxx
 */
export async function searchSongs(keywords: string, limit: number = 30): Promise<Song[]> {
  if (!keywords.trim()) {
    return [];
  }

  const response = await apiFetch(`/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}`);
  const data: SearchResponse = await response.json();

  if (data.code === 200 && data.result?.songs) {
    return data.result.songs.map((song) => ({
      id: song.id,
      title: song.name,
      artist: song.artists.map((a) => a.name).join(', '),
      artists: song.artists.map((a) => ({ id: a.id, name: a.name, tns: [], alias: [] })),
      album: song.album.name,
      albumCover: song.album.picUrl
        ? `https://p3.music.126.net/${song.album.picId}/${song.album.picId}.jpg`
        : 'https://picsum.photos/200',
      duration: song.duration,
      durationFormatted: formatDuration(song.duration),
    }));
  }

  return [];
}

// ==================== Authenticated Fetch ====================

/**
 * Make authenticated API request with cookie
 */
export async function authenticatedFetch(url: string): Promise<Response> {
  return apiFetch(url);
}

export { LoginStatusCode };
