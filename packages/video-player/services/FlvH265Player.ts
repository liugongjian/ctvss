import { FlvPlayer } from './FlvPlayer'
import { PlayerConfig } from '../types/Player'
import FlvJS from '../libs/flv-hevc'

/**
 * FLV H265播放器
 * 基于flv.js
 */
export class FlvH265Player extends FlvPlayer {
  public FlvJS = FlvJS

  constructor(config: PlayerConfig) {
    super(config)
    this.init()
    this.bindEvent()
    this.setDefault()
  }
}
