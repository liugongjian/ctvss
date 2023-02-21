/**
 * 录像管理器
 */
import axios, { CancelTokenSource } from 'axios'
import { Record } from './Record'
import { Screen } from '../Screen/Screen'
import { getTimestamp, getLocaleDate, getDateByTime } from '@/utils/date'
import { getDeviceRecords, getDeviceRecordStatistic, getDeviceRecordRule, describeHeatMap, getDevicePreview, setRecordScale, getDeviceLockList } from '@/api/device'
import { UserModule } from '@/store/modules/user'
import { VSSError } from '@/utils/error'
import { GroupModule } from '@/store/modules/group'

export class RecordManager {
  /* 当前分屏 */
  private screen: Screen
  /* 录像列表 */
  public recordList: Record[]
  /* AI热力列表 */
  public heatmapList: Record[]
  /* 录像日历统计 */
  public recordStatistic: Set<string>
  /* 已加载的录像日期 */
  public loadedRecordDates: Set<number>
  /* 当前正在播放的录像片段 */
  public currentRecord: Record
  /* 查找最新录像定时器 */
  public recordInterval: any
  /* 当前日期（时间戳/秒） */
  public currentDate: number
  /* 当前本地录像片段的起始时间 */
  public localStartTime: number
  /* 分页大小 */
  public pageSize?: string
  /* 录像列表加载状态（不在UI中显示转圈，只用于逻辑判断） */
  public isLoading: boolean
  /* Axios Source */
  private axiosSourceList: CancelTokenSource[]
  /* 录像锁列表 */
  public lockList: any

  private get currentGroupId() {
    return GroupModule.group?.groupId
  }

  private get canLock() {
    return !UserModule.iamUserId || this.screen.ivsLockCloudRecord
  }

  constructor(params: any) {
    this.screen = params.screen
    this.recordList = []
    this.heatmapList = []
    this.lockList = []
    this.recordStatistic = null
    this.loadedRecordDates = new Set()
    this.currentRecord = null
    this.recordInterval = null
    if (this.screen.datetimeRange) {
      this.currentDate = getDateByTime(this.screen.datetimeRange.startTime, 's')
    } else {
      this.currentDate = Math.floor(getLocaleDate().getTime() / 1000)
    }
    this.localStartTime = null
    this.pageSize = null
    this.isLoading = false
    this.axiosSourceList = []
  }

  public init() {
    if (this.screen.currentRecordDatetime) {
      this.loadCache()
    } else {
      this.initReplay()
    }
  }

  public destroy() {
    clearInterval(this.recordInterval)
    this.cancelAxiosSource()
    this.constructor({
      screen: this.screen
    })
  }

  /**
   * 取消Axios请求
   */
  private cancelAxiosSource() {
    this.axiosSourceList.forEach(source => {
      source.cancel()
    })
  }

  /**
   * 初始化录像
   */
  public async initReplay() {
    this.currentRecord = null
    this.getRecordListByDate(this.currentDate)
    this.getRecordStatistic()
    this.getLatestRecord()
  }

  /**
   * 从缓存中恢复
   */
  private async loadCache() {
    try {
      this.screen.isLoading = true
      if (this.screen.deviceId) {
        const date = new Date(this.screen.currentRecordDatetime * 1000)
        const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 4).getTime() / 1000)
        const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000)
        await this.seek(this.screen.currentRecordDatetime)
        this.getRecordStatistic(startTime, endTime)
        this.getLatestRecord()
      }
    } finally {
      this.screen.isLoading = false
    }
  }

  /**
   * 加载指定日期的录像数据
   * @param date 日期
   * @param isConcat 是否合并到现有列表，如果false将覆盖现有列表并播放第一段
   */
  public async getRecordListByDate(date: number, isConcat = false, isSeek = false) {
    try {
      if (!this.screen.deviceId && !isConcat) {
        this.currentDate = date
        throw new Error('缺少deviceId')
      }
      if (!isConcat) {
        this.screen.url = ''
        this.screen.errorMsg = null
        this.screen.isLoading = true
        this.recordList = []
        this.lockList = []
        this.heatmapList = []
        this.currentRecord = null
        this.screen.player && this.screen.player.pause()
        this.loadedRecordDates.clear()
        // 如果是seek操作，不更新当前时间
        if (!isSeek) {
          this.currentDate = date
          this.screen.currentRecordDatetime = date
        }
      } else if (this.loadedRecordDates.has(date)) {
        return
      }
      // 约束录像起始时间和结束时间范围
      if (
        this.screen.datetimeRange &&
        (date < getDateByTime(this.screen.datetimeRange.startTime, 's') || date > this.screen.datetimeRange.endTime)
      ) {
        if (this.recordList.length === 0) {
          throw new VSSError(this.screen.ERROR_CODE.NO_RECORD, this.screen.ERROR.NO_RECORD)
        } else {
          throw new VSSError(this.screen.ERROR_CODE.OUT_OF_RANGE, this.screen.ERROR.OUT_OF_RANGE)
        }
      }
      let startTime = date
      let endTime = date + 24 * 60 * 60
      if (this.screen.datetimeRange) {
        startTime = Math.max(startTime, this.screen.datetimeRange.startTime)
        endTime = Math.min(endTime, this.screen.datetimeRange.endTime)
      }
      // 在SET中存入日期，防止重复加载
      this.loadedRecordDates.add(date)
      !isConcat && this.cancelAxiosSource()
      this.isLoading = true
      console.log('here?   💣  ')
      const records = await this.getRecordList(startTime, endTime)
      // 加载录像锁列表
      const lockList = await this.getDeviceLockList(date, date + 24 * 60 * 60)
      if (date > this.currentDate) {
        this.lockList = this.lockList.concat(lockList)
      } else {
        this.lockList = lockList.concat(this.lockList)
      }
      if (records && records.length) {
        // 如果切换的日期大于现在的日期，则往后添加，否则往前添加
        if (date > this.currentDate) {
          this.recordList = this.recordList.concat(records)
        } else {
          this.recordList = records.concat(this.recordList)
        }
        // 如果不是seek操作，默认播放第一段录像
        if (!isConcat && !isSeek) {
          /**
         * 0云端：获取第一段录像
         * 1本地：获取URL
         */
          if (this.screen.recordType === 0) {
            this.currentRecord = records[0]
            this.screen.currentRecordDatetime = this.currentRecord.startTime
          } else {
            this.screen.currentRecordDatetime = records[0].startTime
            const res = await this.getLocalUrl(records[0].startTime)
            this.screen.codec = res.codec
            this.screen.url = res.url
          }
          // 没有锁定权限禁止播放锁定片段
          // if (this.currentRecord.isLock === 1 && !this.screen.ivsLockCloudRecord) {
          if (this.currentRecord.isLock === 1 && !this.canLock) {
            throw new VSSError(this.screen.ERROR_CODE.LOCKED, this.screen.ERROR.LOCKED)
            this.currentRecord = null
            this.screen.url = ''
            this.screen.errorMsg = this.screen.ERROR.LOCKED
          }
        }
      } else if (!isConcat) {
        this.currentRecord = null
        this.screen.url = ''
        this.screen.errorMsg = this.screen.ERROR.NO_RECORD
      }
      if (!isConcat) this.screen.isLoading = false
      this.isLoading = false
      this.seek(this.screen.currentRecordDatetime, true)
      // 加载AI热力列表
      const heatmaps = await this.getHeatmapList(date, date + 24 * 60 * 60)
      if (date > this.currentDate) {
        this.heatmapList = this.heatmapList.concat(heatmaps)
      } else {
        this.heatmapList = heatmaps.concat(this.heatmapList)
      }
    } catch (e) {
      // 异常时删除日期
      this.loadedRecordDates.delete(date)
      if (!isConcat) {
        this.currentRecord = null
        this.screen.url = ''
        if (e.code === this.screen.ERROR_CODE.NO_RECORD) {
          this.screen.errorMsg = this.screen.ERROR.NO_RECORD
        } else if (e.code === this.screen.ERROR_CODE.NO_STORE) {
          this.screen.errorMsg = this.screen.ERROR.NO_STORE
        } else if (e.code !== -2 && e.code !== -1) {
          this.screen.errorMsg = e.message
        }
      }
      if (!isConcat && e.code !== -2) this.screen.isLoading = false
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 跳转到指定的时间
   * 跳转检查，如当前录像片段已经被锁定则提示
   * 1) 获取指定时间的录像片段，在录像列表中寻找，如果未找到则根据日期添加新列表
   * 2) 如果指定时间的录像!==当前片段，切换currentRecord，并设置初始时间
   * 3) 如果指定时间的录像===当前片段，执行seek()
   * @param time 跳转的目标时间（时间戳/秒）
   * @param isConcat 是否合并到现有列表
   */
  public async seek(time: number, isConcat = false) {
    try {
      if (this.screen.deviceId) {
        this.screen.currentRecordDatetime = time
      } else {
        this.screen.recordManager.currentDate = time
        return
      }
      this.screen.errorMsg = null
      // 约束录像起始时间和结束时间范围
      if (this.screen.datetimeRange && (time < this.screen.datetimeRange.startTime || time > this.screen.datetimeRange.endTime)) {
        if (this.recordList.length === 0) {
          throw new VSSError(this.screen.ERROR_CODE.NO_RECORD, this.screen.ERROR.NO_RECORD)
        } else {
          throw new VSSError(this.screen.ERROR_CODE.OUT_OF_RANGE, this.screen.ERROR.OUT_OF_RANGE)
        }
      }
      let record = this.getRecordByTime(time)
      const date = getDateByTime(time, 's')
      this.currentDate = date
      if (!record) {
        // 判断该日期是否存在SET中
        if (!this.loadedRecordDates.has(date)) {
          console.log('是不是这儿    🚀   ')
          await this.getRecordListByDate(date, isConcat, true)
        }
        record = this.getRecordByTime(time)
      }
      if (record) {
        // 被锁定部分，且用户不具备权限，则不予播放
        // if (record.isLock === 1 && !this.screen.ivsLockCloudRecord) {
        if (record.isLock === 1 && !this.canLock) {
          this.screen.currentRecordDatetime = time
          this.currentDate = time
          this.screen.player && this.screen.player.disposePlayer()
          this.screen.player = null
          this.screen.isLoading = false
          if (!this.isLoading) {
            throw new VSSError(this.screen.ERROR_CODE.LOCKED, this.screen.ERROR.LOCKED)
          }
        } else {
          if (this.screen.recordType === 0) { // 云端录像
            if (!this.currentRecord || this.currentRecord.startTime !== record.startTime) {
              this.currentRecord = record
              this.currentRecord.offsetTime = time - record.startTime
            } else {
              this.currentRecord.offsetTime = null
              this.screen.player.seek(time - this.currentRecord.startTime)
            }
          } else { // 本地录像
            this.updateLocalUrl(time)
          }
        }
      } else {
        this.screen.currentRecordDatetime = time
        this.currentDate = time
        this.screen.player && this.screen.player.disposePlayer()
        this.screen.player = null
        this.screen.isLoading = false
        if (!this.isLoading) {
          // 如果加载录像列表完成后未找到录像片段，则需要显示无录像提示
          throw new VSSError(this.screen.ERROR_CODE.NO_RECORD, this.screen.ERROR.NO_RECORD)
        }
        // 静默错误信息（不在界面上显示）
        throw new Error(this.screen.ERROR.NO_RECORD)
      }
    } catch (e) {
      if (e.code === this.screen.ERROR_CODE.NO_RECORD || e.code === this.screen.ERROR_CODE.OUT_OF_RANGE || e.code === this.screen.ERROR_CODE.LOCKED) {
        this.screen.errorMsg = e.message
      }
      this.screen.currentRecordDatetime = time
      this.screen.recordManager.currentDate = time
      this.screen.player && this.screen.player.disposePlayer()
      this.screen.player = null
      this.screen.isLoading = false
      this.screen.url = ''
    }
  }

  /**
   * 播放下一段
   */
  public playNextRecord() {
    const currentEndtime = this.currentRecord.endTime
    // const nextRecord = this.currentRecord ? this.recordList.find(record => record.startTime > this.currentRecord.startTime) : this.recordList.find(record => record.startTime >= this.screen.currentRecordDatetime)
    // next record which is unlocked
    // also if user's permission = 1, then all records are availabel
    let nextRecord = this.currentRecord ? this.recordList.find(record => record.startTime >= this.currentRecord.endTime) : this.recordList.find(record => record.startTime >= this.screen.currentRecordDatetime)
    if (!this.canLock) {
      nextRecord = this.currentRecord ? this.recordList.find(record => record.startTime >= this.currentRecord.endTime && record.isLock === 0) : this.recordList.find(record => record.startTime >= this.screen.currentRecordDatetime && record.isLock === 0)
    }
    if (nextRecord) {
      if (this.currentRecord) {
        // 云端
        this.currentRecord = nextRecord
        const offsetTime = currentEndtime - nextRecord.startTime
        // 播放下段如有重复直接跳过多余部分
        if (offsetTime > 0) {
          this.currentRecord.offsetTime = offsetTime + 1
        }
        const date = getDateByTime(this.currentRecord.startTime, 's')
        this.currentDate = date
      } else {
        // 本地
        this.updateLocalUrl(nextRecord.startTime)
      }
    }
  }

  /**
   * 定时轮询新录像 && 录像中行人时间段信息
   *
   *
   *
   * 1) 如果当前时间小于今日0点，则不加载最新录像
   * 1) 获取录制规则
   * 2) 获取最后一段录像的endTime作为最新录像的startTime查询参数
   * 3) 查询最新录像
   * 4) 合并数组
   */
  private async getLatestRecord() {
    if (!this.recordList.length) return
    try {
      const interval = await this.getRecordInterval()
      if (interval) {
        this.recordInterval = setInterval(async() => {
          if (this.currentDate < getLocaleDate().getTime() / 1000) return
          const lastRecord = this.recordList[this.recordList.length - 1]
          const startTime = lastRecord.endTime - 3 * 60
          const endTime = Math.floor(new Date().getTime() / 1000)
          console.log('here?   🌙  ')
          const records = await this.getRecordList(startTime, endTime)
          if (records) {
            this.recordList = this.recordList.concat(records)
          }
        }, interval * 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取回放列表
   * @param startTime 开始时间（时间戳/秒）
   * @param endTime 结束时间（时间戳/秒）
   * @returns 录像文件列表(Promise)
   */
  private async getRecordList(startTime: number, endTime: number) {
    const axiosSource = axios.CancelToken.source()
    this.axiosSourceList.push(axiosSource)
    startTime = parseInt(startTime + '')
    endTime = parseInt(endTime + '')
    const res = await getDeviceRecords({
      deviceId: this.screen.deviceId,
      inProtocol: this.screen.inProtocol,
      recordType: this.screen.recordType,
      startTime,
      endTime,
      pageSize: 9999
    }, axiosSource.token)

    return res.records.map((record: any, index: number) => {
      /**
       * 根据 fixRecordGap 标签对缺失的录像片段进行视觉填补，当前后两段 record 的时间间隔
       * 小于 fixRecordGap 标签值时，进行缝隙填补（令当前片段的 endTime = 下一片段的 startTime）
       * 修改后，由于播放的时移速度是根据每一个片段长度动态变化的，所以不会影响播放时时间条变化过程
       */
      const currentEnd = getTimestamp(record.endTime)
      if (UserModule.tags.fixRecordGap) {
        const threshold = +UserModule.tags.fixRecordGap
        record.endTime = currentEnd
        if (index + 1 < res.records.length) {
          const nextStart = getTimestamp(res.records[index + 1]['startTime'])
          record.endTime = (nextStart - currentEnd) / 1000 < threshold ? nextStart : currentEnd
        }
      }
      return new Record({
        startTime: getTimestamp(record.startTime) / 1000,
        endTime: getTimestamp(record.endTime) / 1000,
        duration: record.duration,
        url: record.playUrl[`${record.fileFormat}Url`],
        codec: record.video.codec,
        templateName: record.templateName,
        cover: record.cover,
        fileFormat: record.fileFormat,
        isLock: record.isLock,
        expirationTime: record.expirationTime
      })
    })
  }

  /**
   * 获取日历统计
   */
  public async getRecordStatistic(startTime?: number, endTime?: number) {
    try {
      if (this.screen.recordType === 1) {
        this.recordStatistic = new Set()
        return
      }
      if (!startTime) {
        // 获得最近4月录像统计
        const current = new Date()
        startTime = Math.floor(new Date(current.getFullYear(), current.getMonth() - 4).getTime() / 1000)
        endTime = Math.floor(new Date().getTime() / 1000)
      }
      // 约束录像起始时间和结束时间范围
      if (this.screen.datetimeRange && (endTime < this.screen.datetimeRange.startTime || startTime > this.screen.datetimeRange.endTime)) {
        throw new VSSError(this.screen.ERROR_CODE.OUT_OF_RANGE, this.screen.ERROR.OUT_OF_RANGE)
      }
      if (this.screen.datetimeRange) {
        startTime = Math.max(startTime, this.screen.datetimeRange.startTime)
        endTime = Math.min(endTime, this.screen.datetimeRange.endTime)
      }
      const type = ['cloud', 'local']
      const axiosSource = axios.CancelToken.source()
      this.axiosSourceList.push(axiosSource)
      startTime = parseInt(startTime + '')
      endTime = parseInt(endTime + '')
      const res = await getDeviceRecordStatistic({
        type: type[this.screen.recordType],
        deviceId: this.screen.deviceId,
        inProtocol: this.screen.inProtocol,
        startTime: startTime,
        endTime: endTime
      }, axiosSource.token)
      if (res.records) {
        const recordStatistic: Set<string> = new Set()
        res.records.forEach((statistic: any) => {
          recordStatistic.add(statistic.day)
        })
        this.recordStatistic = recordStatistic
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 根据指定时间查找当前录像列表中的录像片段
   * @param time 指定时间（时间戳/秒）
   * @returns 录像片段
   */
  private getRecordByTime(time: number) {
    return this.recordList.find(record => {
      // 兼容statTime 和 endTime相等的情况
      if (time === record.startTime && record.startTime === record.endTime) {
        time++
      }
      return (time! >= record.startTime) && (time! < record.endTime)
    })
  }

  /**
   * 获取行人时间段列表
   * 来自从化需求
   */
  private async getHeatmapList(startTime: number, endTime: number) {
    const axiosSource = axios.CancelToken.source()
    this.axiosSourceList.push(axiosSource)
    const res = await describeHeatMap({
      deviceId: this.screen.deviceId,
      inProtocol: this.screen.inProtocol,
      recordType: this.screen.recordType,
      startTime,
      endTime,
      pageSize: 9999,
      aiCode: '10006'
    }, axiosSource.token)
    return res.heatMap.map((heatMap: any) => {
      return new Record({
        startTime: getTimestamp(heatMap.startTime) / 1000,
        endTime: getTimestamp(heatMap.endTime) / 1000,
        isHeatmap: true
      })
    })
  }

  /**
   * 获取录制规则时间间隔
   * @returns 时间间隔（秒）
   */
  private async getRecordInterval() {
    const res = await getDeviceRecordRule({
      deviceId: this.screen.deviceId
    })
    return res.interval
  }

  /**
   * 分页获取录像列表
   * 过滤当前所选日期的列表
   */
  public getRecordListByPage(pager: any, currentDate?: number) {
    currentDate = new Date(new Date(new Date(currentDate * 1000)).toLocaleDateString()).getTime() / 1000
    if (currentDate) {
      const recordList = this.recordList && this.recordList.filter(record => {
        return (getDateByTime(record.startTime, 's') === currentDate)
      })
      return {
        recordList: recordList.slice((pager.pageNum - 1) * pager.pageSize, pager.pageNum * pager.pageSize).map(record => ({
          ...record,
          edit: false,
          loading: false
        })),
        length: recordList.length
      }
    }
  }

  /**
   * ================================
   * 本地录像相关操作
   * ================================
   */
  /**
   * 设置播放速率
   */
  public setPlaybackRate(playbackRate: number) {
    setRecordScale({
      deviceId: this.screen.deviceId,
      playUrl: this.screen.url,
      scale: playbackRate.toString()
    })
  }

  /**
   * 获取本地录像地址
   */
  private async getLocalUrl(startTime: number) {
    try {
      startTime = Math.round(startTime)
      this.localStartTime = startTime
      const axiosSource = axios.CancelToken.source()
      this.axiosSourceList.push(axiosSource)
      const endTime = startTime + 24 * 60 * 60 - 1
      let url
      let codec
      const res: any = await getDevicePreview({
        deviceId: this.screen.deviceId,
        inProtocol: this.screen.inProtocol,
        type: 'vod',
        startTime,
        endTime,
        'self-defined-headers': {
          'role-id': this.screen.roleId || '',
          'real-group-id': this.screen.realGroupId || ''
        }
      }, axiosSource.token)
      if (res.playUrl) {
        url = res.playUrl.flvUrl
        codec = res.video.codec
        this.screen.errorMsg = null
      }
      return {
        url,
        codec
      }
    } catch (e) {
      throw new VSSError(e.code, e.message, null)
    }
  }

  /**
   * 加载/更新 本地播放源
   * time: 秒
   */
  private async updateLocalUrl(time: number) {
    try {
      this.screen.isLoading = true
      const res = await this.getLocalUrl(time)
      this.screen.codec = res.codec
      this.screen.url = res.url
    } catch (e) {
      if (e.code !== -2 && e.code !== -1) {
        this.screen.errorMsg = e.message
      }
    } finally {
      this.screen.isLoading = false
    }
  }

  /**
   * =================================
   * 录像锁相关
   * =================================
   */
  private async getDeviceLockList(startTime: number, endTime: number, pageSize?: number, pageNum?: number) {
    try {
      const res: any = await getDeviceLockList({
        deviceId: this.screen.deviceId,
        inProtocol: this.screen.inProtocol,
        groupId: this.currentGroupId,
        startTime,
        endTime,
        recordType: this.screen.recordType
      })
      return res.lockPeriods
    } catch (e) {
      this.screen.errorMsg = e.message
    }
  }
}
