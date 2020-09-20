import { Component, Mixins } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import DeviceMixin from './deviceMixin'
import Screen from '../models/Screen'

@Component
export default class ScreenMixin extends Mixins(DeviceMixin) {
  public screenList: Array<Screen> = []
  public isFullscreen = false
  public maxSize = 4
  public currentIndex = 0
  public dialogs = {
    deviceDir: false
  }

  /**
   * 初始化分屏
   */
  public initScreen() {
    let screenList: Array<Screen> = []
    let startIndex = 0
    if (this.screenList.length) {
      screenList = this.screenList.slice(0, this.maxSize)
      startIndex = screenList.length
    }
    for (let i = startIndex; i < this.maxSize; i++) {
      const screen = new Screen()
      screenList.push(screen)
    }
    this.screenList = screenList
  }

  /**
   * 获取组列表
   */
  public async getGroupList(routeName: string) {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    const res = await getGroups(params)
    this.groupList = res.groups
    if (this.groupList.length) {
      if (!this.$route.query.groupId) {
        await DeviceModule.SetGroup(this.groupList[0])
        this.$route.query.groupId = this.groupList[0]
        this.$router.push({
          name: routeName,
          query: {
            groupId: this.currentGroupId
          }
        })
      } else {
        const currentGroup = this.groupList.find((group: Group) => group.groupId === this.$route.query.groupId)
        await DeviceModule.SetGroup(currentGroup)
      }
      await this.initDirs()
    }
    this.loading.group = false
  }

  /**
   * 切换分屏数量
   */
  public changeMaxSize(size: number) {
    this.maxSize = size
    if (this.currentIndex >= this.maxSize) {
      this.currentIndex = this.maxSize - 1
    }
    this.initScreen()
  }

  /**
   * 全屏
   */
  public fullscreen() {
    const element: any = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    }
  }

  /**
   * 检查是否全屏
   */
  public checkFullscreen() {
    const doc: any = document
    this.isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
    if (!this.isFullscreen) {
      this.screenList.forEach((screen: Screen) => {
        screen.exitFullscreen()
      })
    }
  }

  /**
   * 检查设备树中的设备项是否选择
   */
  public checkTreeItemStatus(item: any) {
    if (item.type !== 'ipc') return false
    return !!this.screenList.find(screen => screen.deviceId === item.id)
  }

  /**
   * 选择分屏
   */
  public async selectScreen(index: number) {
    this.currentIndex = index
  }

  /**
   * 选择视频
   * @param screen 视频
   */
  public selectDevice(screen: Screen) {
    this.dialogs.deviceDir = true
  }
}
