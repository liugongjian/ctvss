import { getLocalStorage, setLocalStorage } from '@vss/base/utils/storage'
import { UserModule } from '@/store/modules/user'
import { msFormate } from '@vss/base/utils/date'
import { saveLogs } from '@vss/device/api/log'

const SCREEN_LOGS_KEY = 'screenLogs'

class ScreenLog {
  /**
   * 添加日志
   */
  public addLog(screen) {
    const logs: Array<any> = JSON.parse(getLocalStorage(SCREEN_LOGS_KEY)) || []
    const log = {
      ...screen.log,
      mainUserID: UserModule.mainUserID,
      deviceId: screen.deviceId,
      inProtocol: screen.inProtocol,
      streamNum: screen.streamNum,
      isLive: screen.isLive,
      previewTime: msFormate(screen.log.previewEndTimestamp - screen.log.previewStartTimestamp),
      playerLoadTime: msFormate(screen.log.playerCanplayTimstamp - screen.log.playerInitTimestamp),
      totalTime: msFormate(screen.log.playerCanplayTimstamp - screen.log.previewStartTimestamp)
    }
    logs.push(log)
    console.log('播放器日志', log)
    setLocalStorage(SCREEN_LOGS_KEY, logs)
  }

  /**
   * 保存日志到后端，并清空本地日志
   */
  public flushLogs() {
    try {
      const logs: Array<any> = JSON.parse(getLocalStorage(SCREEN_LOGS_KEY))
      if (logs && logs.length) {
        saveLogs(logs)
        setLocalStorage(SCREEN_LOGS_KEY, [])
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export default new ScreenLog()
