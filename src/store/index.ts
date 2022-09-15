import Vue from 'vue'
import Vuex from 'vuex'
import { IAppState } from './modules/app'
import { IUserState } from './modules/user'
import { ITagsViewState } from './modules/tags-view'
import { IErrorLogState } from './modules/error-log'
import { IPermissionState } from './modules/permission'
import { ISettingsState } from './modules/settings'
import { IDeviceState } from './modules/device'
import { IGroupState } from './modules/group'
import { IScreenState } from './modules/screen'
import { IMapState } from './modules/map'
import { IIBoxState } from './modules/ibox'
import { Device as DeviceNew } from '@vss/device/store/modules/device'

Vue.use(Vuex)

export interface IRootState {
  app: IAppState
  user: IUserState
  tagsView: ITagsViewState
  errorLog: IErrorLogState
  permission: IPermissionState
  settings: ISettingsState
  device: IDeviceState
  group: IGroupState
  screen: IScreenState
  map: IMapState
  ibox: IIBoxState
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({
  modules: {
    deviceNew: DeviceNew
  }
})
