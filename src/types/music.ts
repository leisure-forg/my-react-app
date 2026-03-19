// NetEase Cloud Music API Types

// ==================== Login APIs ====================

export interface LoginKeyResponse {
  data: {
    code: number;
    unikey: string;
  };
  code: number;
}

export interface QRCodeResponse {
  code: number;
  data: {
    qrurl: string;
    qrimg: string; // base64 encoded image
  };
}

export interface LoginCheckResponse {
  code: number;
  message?: string;
  cookie?: string;
}

export interface LoginStatus {
  code: number;
  message: string;
}

// Login status codes
export enum LoginStatusCode {
  WAITING_FOR_SCAN = 801,
  SCANNED_WAITING_CONFIRM = 802,
  LOGIN_SUCCESS = 803,
  LOGIN_EXPIRED = 800,
}

// ==================== Likelist API ====================

export interface LikelistResponse {
  ids: number[];
  code: number;
}

// ==================== Song Detail API ====================

export interface SongArtist {
  id: number;
  name: string;
  tns: string[];
  alias: string[];
}

export interface SongAlbum {
  id: number;
  name: string;
  picUrl: string;
  tns: string[];
  pic_str: string;
  pic: number;
}

export interface SongQuality {
  br: number;
  fid: number;
  size: number;
  vd: number;
  sr: number;
}

export interface SongDetail {
  name: string;
  mainTitle: string | null;
  additionalTitle: string | null;
  id: number;
  pst: number;
  t: number;
  ar: SongArtist[];
  alia: string[];
  pop: number;
  st: number;
  rt: string | null;
  fee: number;
  v: number;
  crbt: any;
  cf: string;
  al: SongAlbum;
  dt: number; // duration in milliseconds
  h?: SongQuality;
  m?: SongQuality;
  l?: SongQuality;
  sq?: SongQuality;
  hr: any;
  a: any;
  cd: string;
  no: number;
  rtUrl: string | null;
  ftype: number;
  rtUrls: any[];
  djId: number;
  copyright: number;
  s_id: number;
  mark: number;
  originCoverType: number;
  originSongSimpleData: any;
  tagPicList: any;
  resourceState: boolean;
  version: number;
  songJumpInfo: any;
  entertainmentTags: any;
  awardTags: any;
  displayTags: any;
  markTags: any[];
  single: number;
  noCopyrightRcmd: any;
  mv: number;
  mst: number;
  cp: number;
  rtype: number;
  rurl: string | null;
  publishTime: number;
}

export interface SongPrivilege {
  id: number;
  fee: number;
  payed: number;
  st: number;
  pl: number;
  dl: number;
  sp: number;
  cp: number;
  subp: number;
  cs: boolean;
  maxbr: number;
  fl: number;
  toast: boolean;
  flag: number;
  preSell: boolean;
  playMaxbr: number;
  downloadMaxbr: number;
  maxBrLevel: string;
  playMaxBrLevel: string;
  downloadMaxBrLevel: string;
  plLevel: string;
  dlLevel: string;
  flLevel: string;
  rscl: any;
  freeTrialPrivilege: {
    resConsumable: boolean;
    userConsumable: boolean;
    listenType: any;
    cannotListenReason: any;
    playReason: any;
    freeLimitTagType: any;
  };
  rightSource: number;
  chargeInfoList: {
    rate: number;
    chargeUrl: string | null;
    chargeMessage: string | null;
    chargeType: number;
  }[];
  code: number;
  message: string | null;
  plLevels: any;
  dlLevels: any;
  ignoreCache: any;
  bd: any;
}

export interface SongDetailResponse {
  songs: SongDetail[];
  privileges: SongPrivilege[];
  code: number;
}

// ==================== Lyric API ====================

export interface LyricContent {
  version: number;
  lyric: string;
}

export interface LyricResponse {
  sgc: boolean;
  sfy: boolean;
  qfy: boolean;
  lrc: LyricContent;
  klyric: LyricContent;
  tlyric: LyricContent;
  romalrc: LyricContent;
  code: number;
}

// Parsed lyric line for display
export interface LyricLine {
  time: number; // time in milliseconds
  text: string;
}

// ==================== Search API ====================

export interface SearchArtist {
  img1v1Url: string;
  musicSize: number;
  albumSize: number;
  img1v1: number;
  name: string;
  alias: string[];
  id: number;
  picId: number;
}

export interface SearchAlbum {
  publishTime: number;
  size: number;
  artist: {
    img1v1Url: string;
    musicSize: number;
    albumSize: number;
    img1v1: number;
    name: string;
    alias: string[];
    id: number;
    picId: number;
  };
  copyrightId: number;
  name: string;
  id: number;
  picId: number;
  mark: number;
  status: number;
}

export interface SearchSong {
  album: SearchAlbum;
  fee: number;
  duration: number;
  rtype: number;
  ftype: number;
  artists: SearchArtist[];
  copyrightId: number;
  mvid: number;
  name: string;
  alias: string[];
  id: number;
  mark: number;
  status: number;
}

export interface SearchTrpRule {
  [key: string]: string;
}

export interface SearchTrp {
  rules: SearchTrpRule[];
}

export interface SearchResult {
  songs: SearchSong[];
  hasMore: boolean;
  songCount: number;
}

export interface SearchResponse {
  result: SearchResult;
  code: number;
  trp: SearchTrp;
}

// ==================== Helper Types ====================

// Simplified song type for UI display
export interface Song {
  id: number;
  title: string;
  artist: string;
  artists: SongArtist[];
  album: string;
  albumCover: string;
  duration: number; // in milliseconds
  durationFormatted: string;
  url?: string; // Playable URL
}

// ==================== Song URL API ====================

export interface FreeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  listenType: any;
  cannotListenReason: any;
  playReason: any;
  freeLimitTagType: any;
}

export interface FreeTimeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  type: number;
  remainTime: number;
}

export interface SongUrlData {
  id: number;
  url: string;
  br: number;
  size: number;
  md5: string;
  code: number;
  expi: number;
  type: string;
  gain: number;
  peak: number;
  closedGain: number;
  closedPeak: number;
  fee: number;
  uf: any;
  payed: number;
  flag: number;
  canExtend: boolean;
  freeTrialInfo: any;
  level: string;
  encodeType: string;
  channelLayout: any;
  freeTrialPrivilege: FreeTrialPrivilege;
  freeTimeTrialPrivilege: FreeTimeTrialPrivilege;
  urlSource: number;
  rightSource: number;
  podcastCtrp: any;
  effectTypes: any;
  time: number;
  message: any;
  levelConfuse: any;
  musicId: string;
  accompany: any;
  sr: number;
  auEff: any;
  immerseType: any;
  beatType: number;
}

export interface SongUrlResponse {
  code: number;
  data: SongUrlData[];
}
