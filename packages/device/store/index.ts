import Vue from 'vue'
import Vuex from 'vuex'
import { IDeviceAbcState } from './modules/device-abc'

Vue.config.devtools = true

Vue.use(Vuex)

export interface IRootState {
  device: IDeviceAbcState
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({})
