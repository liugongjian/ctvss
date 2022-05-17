import { Component, Vue, Inject } from 'vue-property-decorator'
import { Player } from '@/components/Player/services/Player'
import { removeClass, addClass } from '@/utils/dom'

@Component
export default class ComponentMixin extends Vue {
  @Inject('getPlayer')
  public getPlayer: Function

  public get player(): Player {
    return this.getPlayer()
  }

  /* 移入Popover */
  public enterPopover() {
    addClass(this.player.container.parentElement.parentElement, 'player__wrap--popover')
  }

  /* 移出Popover */
  public leavePopover() {
    removeClass(this.player.container.parentElement.parentElement, 'player__wrap--popover')
  }
}
