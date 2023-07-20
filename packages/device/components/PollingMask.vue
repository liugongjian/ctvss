<template>
  <div v-show="isShow" class="polling-mask">
    <div class="polling-mask__tools">
      <div class="polling-mask__tools__status">
        <span v-if="pollingStatus === pollingStatusEnum.Pause">轮巡已暂停</span>
        <span v-else>{{ isLoading ? '查询设备中...' : '当前轮巡中...' }}</span>
      </div>
      <div v-if="policy === 'polling'" class="polling-mask__tools__item">
        <svg-icon
          name="clock"
          class="polling-mask__tools__clock"
          width="16px"
          height="16px"
        />
        <el-select
          v-model="pollingInterval"
          class="polling-mask__tools__select"
          size="mini"
          placeholder="请选择"
          :disabled="isLoading"
          @change="intervalChange"
        >
          <el-option
            v-for="item in pollingIntervalList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div v-if="policy === 'polling'">
        <div v-if="pollingStatus === pollingStatusEnum.Working" class="polling-mask__tools__item">
          <el-button size="mini" :disabled="isLoading" @click="pollingHandle(toolsEnum.PausePolling)">
            <svg-icon name="pause" />暂停
          </el-button>
        </div>
        <div v-if="pollingStatus === pollingStatusEnum.Pause" class="polling-mask__tools__item">
          <el-button size="mini" :disabled="isLoading" @click="pollingHandle(toolsEnum.ResumePolling)">
            <svg-icon name="play" />继续
          </el-button>
        </div>
        <div class="polling-mask__tools__item">
          <el-button size="mini" :disabled="isLoading" @click="pollingHandle(toolsEnum.StopPolling)">
            <svg-icon name="stop" />结束
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { PollingStatusEnum, ToolsEnum } from '@vss/device/enums/index'

@Component({
  name: 'PollingMask'
})
export default class extends Vue {
  pollingStatusEnum = PollingStatusEnum
  toolsEnum = ToolsEnum

  @Prop()
  private currentDir

  /* 轮巡及一键播放 */
  @Prop({ default: {} })
  private screenManager

  /* 轮巡状态 */
  private get pollingStatus() {
    return this.screenManager ? this.screenManager.executeQueueConfig.status : PollingStatusEnum.Free
  }

  /* 轮巡间隔 */
  private get pollingInterval() {
    return this.screenManager ? this.screenManager.executeQueueConfig.interval : 20
  }

  private get isShow() {
    const flag = this.pollingStatus !== PollingStatusEnum.Free || this.isLoading
    this.$emit('is-show-change', flag)
    return flag
  } 

  private isLoading = false

  private policy = 'polling'

  private pollingIntervalList = [
    { value: 5, label: '5秒' },
    { value: 10, label: '10秒' },
    { value: 20, label: '20秒' },
    { value: 40, label: '40秒' },
    { value: 60, label: '1分钟' },
    { value: 180, label: '3分钟' },
    { value: 300, label: '5分钟' },
    { value: 600, label: '10分钟' },
    { value: 1800, label: '30分钟' }
  ]

  private pollingHandle(val) {
    this.$emit('polling-handle', val, this.currentDir)
  }

  private intervalChange(val: number) {
    this.$emit('polling-handle', ToolsEnum.IntervalChange, val)
  }

  private beforeDestroy() {
    this.$emit('polling-handle', ToolsEnum.StopPolling, this.currentDir)
  }
}
</script>
<style lang="scss" scoped>
  .polling-mask {
    position: absolute;
    display: flex;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 75%);
    align-items: center;

    &__tools {
      width: 100%;
      text-align: center;
      font-size: 12px;
      margin-top: -30%;

      &__item {
        margin-bottom: 15px;
      }

      &__clock {
        vertical-align: middle;
      }

      &__status {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 30px;
      }

      &__select {
        width: 86px;
        margin-left: 5px;
      }

      .el-button--mini {
        width: 100px;
      }

      /* stylelint-disable-next-line no-descending-specificity */
      .svg-icon {
        color: inherit;
      }
    }
  }
</style>
