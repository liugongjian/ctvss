import Vue from 'vue'
import Vuex from 'vuex'
import { IDeviceState } from './modules/device'

Vue.use(Vuex)

export interface IRootState {
  device: IDeviceState
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({})
