export type PlayerType = 'flv' | 'hls' | 'rtc' | 'h265'

export type OnRetryParams = {
  immediate: boolean;
}

// @ts-ignore
export interface EnhanceHTMLVideoElement extends HTMLVideoElement {
  mozHasAudio?: boolean;
  webkitAudioDecodedByteCount?: number;
}

export interface PlayerConfig {
  container: HTMLDivElement;
  type: PlayerType;
  url: string;
  isLive: boolean;
  isDebug: boolean;
  isAutoPlay: boolean;
  playbackRate?: number;
  volume: number;
  onPlay?: () => void;
  onPause?: () => void;
  onRetry?: (immediate: OnRetryParams) => void;
  // onTimeUpdate?: (currentTime: number) => void;
  // onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  // onSeeked?: (currentTime) => void;
  onBuffered?: (buffered: number) => void;
  onLoadStart?: () => void;
  onCanplay?: () => void;
}
