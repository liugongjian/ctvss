import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IMapState {
  mapInfo?: any
  markerInfo: any
  interestInfo?: any
  fontInfo?: any
  polygonInfo?: any
}

@Module({ dynamic: true, store, name: 'map' })
class Map extends VuexModule implements IMapState {
  public mapInfo: any = null
  public markerInfo: any = null
  public interestInfo: any = null
  public fontInfo: any = null
  public polygonInfo: any = null

  @Mutation
  public SET_MAP_INFO(payload: any) {
    this.mapInfo = payload
  }

  @Action
  public SetMapInfo(payload: any) {
    this.SET_MAP_INFO({ ...payload })
  }

  @Mutation
  public SET_MARKER_INFO(payload: any) {
    this.markerInfo = payload
  }

  @Action
  public SetMarkerInfo(payload: any) {
    const info = { ...payload }
    const appearance = info.appearance || '{}'
    info.appearance = JSON.parse(appearance)
    this.SET_MARKER_INFO(info)
  }

  @Mutation
  public SET_INTEREST_INFO(payload: any) {
    this.interestInfo = payload
  }

  @Action
  public SetInterestInfo(payload: any) {
    const info = { ...payload }
    const appearance = info.appearance || '{}'
    info.appearance = JSON.parse(appearance)
    this.SET_INTEREST_INFO(info)
  }

  @Action
  public ResetInterestInfo() {
    this.SET_INTEREST_INFO({
      tagName: '未命名',
      type: 'InterestPoint',
      description: '',
      points: [{ longitude: '', latitude: '' }],
      color: '',
      colorType: '',
      appearance: {
        color: '#1e78e0',
        colorType: 'bubble',
        showLabel: false
      }
    })
  }

  @Mutation
  public SET_FONT_INFO(payload: any) {
    this.fontInfo = payload
  }

  @Action
  public SetFontInfo(payload: any) {
    const info = { ...payload }
    const appearance = info.appearance || '{}'
    info.appearance = JSON.parse(appearance)
    this.SET_FONT_INFO(info)
  }

  @Action
  public ResetFontInfo() {
    this.SET_FONT_INFO({
      tagName: '未命名',
      type: 'InterestPoint',
      description: '',
      points: [{ longitude: '', latitude: '' }],
      color: '',
      colorType: '',
      appearance: {
        color: '#333',
        colorType: 'text'
      }
    })
  }

  @Mutation
  public SET_POLYGON_INFO(payload: any) {
    this.polygonInfo = payload
  }

  @Action
  public SetPolygonInfo(payload: any) {
    const info = { ...payload }
    const appearance = info.appearance || '{}'
    info.appearance = JSON.parse(appearance)
    this.SET_POLYGON_INFO(info)
  }

  @Action
  public ResetPolygonInfo() {
    const appearance = {
      fillColor: '#545d80',
      strokeColor: '#ffc000',
      wallColor: '#eab754',
      roofColor: '#ffce6f'
    }
    this.SET_POLYGON_INFO({
      tagName: '未命名',
      type: 'HighLightArea', // HighLightArea;InterestBuilding
      description: '',
      points: [],
      color: '',
      colorType: '',
      appearance
    })
  }
}

export const MapModule = getModule(Map)
