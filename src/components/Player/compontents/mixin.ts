import { Component, Vue, Inject } from 'vue-property-decorator'
import { Player } from '../models/Player'

@Component({
  name: 'PlayPause'
})
export default class ComponentMixin extends Vue {
  @Inject('getPlayer')
  public getPlayer: Function

  public get player(): Player {
    return this.getPlayer()
  }
}
