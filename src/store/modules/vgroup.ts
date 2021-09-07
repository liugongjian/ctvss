import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IVGroupInfo {
  roleId: string,
  realGroupId: string
  realGroupInProtocol: string
}

@Module({ dynamic: true, store, name: 'vgroup' })
class VGroupInfo extends VuexModule implements IVGroupInfo {
  public roleId = ''
  public realGroupId = ''
  public realGroupInProtocol = ''

  @Mutation
  public SET_ROLEID(payload: string) {
    this.roleId = payload
  }

  @Mutation
  public SET_REALGROUPID(payload: string) {
    this.realGroupId = payload
  }

  @Mutation
  public SET_REALGROUPINPROTOCOL(payload: string) {
    this.realGroupInProtocol = payload
  }

  @Action
  public SetRoleID(payload: string) {
    this.SET_ROLEID(payload)
  }

  @Action
  public SetRealGroupId(payload: string) {
    this.SET_REALGROUPID(payload)
  }

  @Action
  public SetRealGroupInProtocol(payload: string) {
    this.SET_REALGROUPINPROTOCOL(payload)
  }
  @Action
  public resetVGroupInfo() {
    this.SET_ROLEID('')
    this.SET_REALGROUPID('')
    this.SET_REALGROUPINPROTOCOL('')
  }
}

export const VGroupModule = getModule(VGroupInfo)
