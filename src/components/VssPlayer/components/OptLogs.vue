<template>
  <div class="video-info" :class="!isEmpty ? transScale : transScaleNull">
    <transition-group v-if="!isEmpty" class="roll-log" name="roll" mode="out-in">
      <div v-for="(item, index) in optLogs" :key="index" class="log-info" :class="index === 0 ? 'info-top' : 'info-bottom'">
        <p>{{ item.operationTime }}</p>
        <p>{{ item.operationName }}</p>
        <p>{{ item.operator }}</p>
        <p>{{ item.sourceIP }}</p>
      </div>
    </transition-group>
    <transition v-else class="roll-log" name="roll" mode="out-in">
      <div class="log-info">
        <p>暂无操作记录</p>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import ResizeObserver from 'resize-observer-polyfill'
import { getOptLogById } from '@/api/operationLog'

@Component({
  name: 'OptLogs'
})
export default class extends Vue {
  @Prop()
  private deviceId: any
  // @Prop()
  // optLogVisiable: boolean
  @Prop()
  private playerWrap: string

  private optLogs: any = null // 最新的 操作信息
  private optLogsInterval: any
  private addLogsTimer: any
  private tmp = 10
  private resizeObserver: any
  private transScale = null
  private transScaleNull = null
  private isEmpty = false

  private async mounted() {
    await this.init()
    this.resizeObserver = new ResizeObserver((entries: any) => {
      // for (let entry of entries) {
      //   entry.target.style.borderRadius = Math.max(0, 250 - entry.contentRect.width) + 'px';
      // }
      let height = entries[0]['target']['clientHeight']
      let width = entries[0]['target']['clientWidth']
      this.$nextTick(() => {
        // 大小判断条件和分频数量不完全相关
        if ((height <= 300 && height > 200) || (width <= 372 && width > 300)) {
          // this.transScale = 'transform:scale(0.8);right:5px'
          this.transScale = 'small'
          this.transScaleNull = 'small-null'
        } else if (width > 800) {
          // this.transScale = 'transform:scale(1.3);right:15px;'
          this.transScale = 'large'
          this.transScaleNull = 'large-null'
        } else if ((width <= 300 && width > 175)) {
          this.transScale = 'sub-small'
          this.transScaleNull = 'sub-small-null'
        } else if (width <= 175 && width > 125) {
          this.transScale = 'super-small'
          this.transScaleNull = 'super-small-null'
        } else if (width <= 125) {
          this.transScale = 'max-small'
          this.transScaleNull = 'max-small-null'
        } else {
          this.transScale = null       
          this.transScaleNull = null
          // this.transScale = 'transform:scale(1);right:15px;'
        }
      })
    })
    this.resizeObserver.observe(document.getElementById(this.playerWrap))                                                                                                                                                                                   
  }

  // 销毁定时器
  private async destroyed() {
    this.resizeObserver.disconnect()
    clearTimeout(this.addLogsTimer)
    clearInterval(this.optLogsInterval)
  }

  // 初始化
  private async init() {
    try {
    // 第一次开启，获取前 10 分钟信息
      await this.getOptLog()
      // 清理定时器
      clearTimeout(this.addLogsTimer)
      clearInterval(this.optLogsInterval)
      // 开启轮询
      this.getLatestLogs()
    } catch (e) {
      this.$message.error(e)
    }
  }

  // 开启轮询, 5 秒一次
  private async getLatestLogs() {
    try {
      this.optLogsInterval = setInterval(async() => {
        await this.getOptLog()
      }, 5 * 1000)
    } catch (e) {
      this.$message.error(e)
    }
  }

  // 获取操作信息
  private async getOptLog() {
    try {
      // 请求来的数据是否是最新的数据？，后端数据是怎么排序的？
      const currentTime = +(('' + (new Date()).getTime()).slice(0, -3)) // s
      const startTime = currentTime - 10 * 60
      const res: any = await getOptLogById({
        resourceType: 3,
        resourceId: this.deviceId,
        pageSize: 2,
        pageNum: 1,
        startTime: startTime, // 前十分钟
        endTime: currentTime // 当前查询时间
      })
      const logList = res.operationLogList.length > 0 ? res.operationLogList : null
      this.isEmpty = !logList
      // 数据没有改变，不做替换，改变则替换
      if (this.optLogs) {
      // 从轮询开始检查，不包括第一次请求
        if(!logList) return // 日志信息被人为清空时
        const isChanged = logList.some((newitem: any, index: any) => {
          return newitem.operationTime !== this.optLogs[index].operationTime
        })
        if (isChanged) {
          // 数据更新，需要淡入淡出
          this.optLogs.splice(0, 2) // 淡出
          this.addLogsTimer = setTimeout(() => {
            this.optLogs.push(logList[0], logList[1]) // 淡入
          }, 0.5 * 1000)
        }
      } else {
      // 第一次请求
        this.optLogs = logList
      }
    } catch (e) {
      this.$message.error(e)
    }
  }
}
</script>
<style lang="scss" scoped>
  /* 视频信息展示 */
  .video-info {
    * {
      user-select: none;
    }

    position: absolute;
    z-index: 15;
    bottom: 50px;
    right: 15px;
    width: 145px;
    background: transparent;
    color: #fff;

    &.large {
      transform: scale(1.3);
      right: 3%;
      bottom: 15%;
    }

    &.small {
      transform: scale(0.8);
      right: 0;
      margin-bottom: -25px;
    }

    &.sub-small {
      transform: scale(0.5);
      right: -10%;
      bottom: -10%;
    }

    &.super-small {
      transform: scale(0.4);
      right: -20%;
      bottom: -15%;
    }

    &.max-small {
      transform: scale(0.3);
      right: -35%;
      bottom: -35%;
    }

    &.large-null {
      transform: scale(1.3);
      right: 3%;
      bottom: 15%;
    }

    &.small-null {
      transform: scale(0.8);
      right: 0;
      // margin-bottom: -25px;
    }

    &.sub-small-null {
      transform: scale(0.4);
      right: -30px;
      bottom: 20px;
    }

    &.super-small-null {
      transform: scale(0.4);
      right: -20%;
      bottom: 10%;
    }

    &.max-small-null {
      transform: scale(0.2);
      right: -50%;
      bottom: 10%;
    }
  }

  /* 视频信息展示 */
  .log-info {
    transition: all 0.5s linear;
    font-size: 12px;
    // margin-bottom: 15px;
    width: auto;
    background-color: rgba(111, 111, 111, 50%);
    padding-top: 5px;
    padding-bottom: 5px;
    margin-bottom: 0;

    p {
      width: auto;
      margin: 5px;
    }
  }

  /* 操作信息淡入淡出 */
  .roll-complete-leave-active {
    position: absolute;
  }

  .roll-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .roll-enter {
    opacity: 0;
    transform: translateY(30px);
  }

  .roll-enter-to,
  .roll-leave {
    opacity: 1;
  }

  .info-top {
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  }

  .info-bottom {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

</style>
