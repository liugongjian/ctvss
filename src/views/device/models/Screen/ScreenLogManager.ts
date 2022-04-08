
import { getLocalStorage, setLocalStorage } from '@/utils/storage'
import { msFormate } from '@/utils/date'

const SCREEN_LOGS_KEY = 'screenLogs'

class ScreenLog {
  /**
   * 添加日志
   */
  public addLog(screen) {
    const logs: Array<any> = JSON.parse(getLocalStorage(SCREEN_LOGS_KEY)) || []
    const log = {
      ...screen.log,
      deviceId: screen.deviceId,
      inProtocol: screen.inProtocol,
      streamNum: screen.streamNum,
      isLive: screen.isLive,
      previewTime: msFormate(screen.log.previewEndTimestamp - screen.log.previewStartTimestamp),
      playerLoadTime: msFormate(screen.log.playerCanplayTimstamp - screen.log.playerInitTimestamp),
      totalTime: msFormate(screen.log.playerCanplayTimstamp - screen.log.previewStartTimestamp)
    }
    logs.push(log)
    console.log(log)
    setLocalStorage(SCREEN_LOGS_KEY, logs)
  }

  /**
   * 保存日志到后端，并清空本地日志
   */
  public flushLogs() {
    const logs: Array<any> = JSON.parse(getLocalStorage(SCREEN_LOGS_KEY))
    console.log(logs)
    setLocalStorage(SCREEN_LOGS_KEY, [])
  }
}

export default new ScreenLog()
