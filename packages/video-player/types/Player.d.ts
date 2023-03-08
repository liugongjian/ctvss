import { TypeEnum, CodecEnum } from '../enums'

export type OnRetryParams = {
  immediate: boolean;
}

// @ts-ignore
export interface EnhanceHTMLVideoElement extends HTMLVideoElement {
  mozHasAudio?: boolean;
  webkitAudioDecodedByteCount?: number;
  type?: string;
}

export interface PlayerConfig {
  container: HTMLDivElement;
  type: TypeEnum;
  codec: CodecEnum;
  url: string;
  isLive: boolean;
  isDebug: boolean;
  isAutoPlay: boolean;
  playbackRate?: number;
  volume: number;
  isMuted: boolean;
  poster: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onRetry?: (immediate: OnRetryParams) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onRateChange?: (playbackRate: number) => void;
  onSeeked?: (currentTime) => void;
  onBuffered?: (buffered: number) => void;
  onLoadStart?: () => void;
  onCanplay?: () => void;
}
