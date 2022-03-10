import { Component, Vue, Inject } from 'vue-property-decorator'
import { Player } from '@/components/Player/models/Player'

@Component
export default class ComponentMixin extends Vue {
  @Inject('getPlayer')
  public getPlayer: Function

  public get player(): Player {
    console.log('inject: getPlayer')
    return this.getPlayer()
  }
}
