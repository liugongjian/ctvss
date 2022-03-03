<template>
  <div class="vss-player__wrap">
    <Player
      ref="player"
      :type="type"
      :url="url"
      :codec="codec"
      :is-debug="true"
      @onCreate="onPlayerCreate"
    >
      <template slot="body">
        <H265Icon :codec="codec" />
      </template>
      <template slot="right">
        <Snapshot :player="player" />
      </template>
    </Player>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide } from 'vue-property-decorator'
import { PlayerType } from '../Player/models/Player.d'
import Player from '../Player/index.vue'
/**
 * 子组件库
 */
import H265Icon from './components/H265Icon.vue'
import Snapshot from './components/Snapshot.vue'

@Component({
  name: 'VssPlayer',
  components: {
    Player,
    H265Icon,
    Snapshot
  }
})
export default class extends Vue {
  /* 播放器类型 */
  @Prop()
  private type!: PlayerType

  /* 播放流地址 */
  @Prop()
  private url!: string

  /* 播放流地址 */
  @Prop({
    default: 'h264'
  })
  private codec: string

  /* 播放器实例 */
  private player: Player = null

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }

  /* 当播放器实例创建 */
  private onPlayerCreate(player) {
    console.log(player)
    this.player = player
  }
}
</script>
