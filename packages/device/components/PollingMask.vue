<template>
  <div class="polling-mask">
    <div class="polling-mask__tools">
      <div class="polling-mask__tools__status">
        <span v-if="pollingStatus === 'pause'">轮巡已暂停</span>
        <span v-else>{{ polling.isLoading ? '查询设备中...' : '当前轮巡中...' }}</span>
      </div>
      <div class="polling-mask__tools__item">
        <svg-icon
          name="clock"
          class="polling-mask__tools__clock"
          width="16px"
          height="16px"
        />
        <el-select
          v-model="polling.interval"
          class="polling-mask__tools__select"
          size="mini"
          placeholder="请选择"
          :disabled="polling.isLoading"
          @change="intervalChange"
        >
          <el-option
            v-for="item in pollingInterval"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div v-if="pollingStatus === 'working'" class="polling-mask__tools__item">
        <el-button size="mini" :disabled="polling.isLoading" @click="pollingHandle('pausePolling')">
          <svg-icon name="pause" />暂停
        </el-button>
      </div>
      <div v-if="pollingStatus === 'pause'" class="polling-mask__tools__item">
        <el-button size="mini" :disabled="polling.isLoading" @click="pollingHandle('resumePolling')">
          <svg-icon name="play" />继续
        </el-button>
      </div>
      <div class="polling-mask__tools__item">
        <el-button size="mini" :disabled="polling.isLoading" @click="pollingHandle('stopPolling')">
          <svg-icon name="stop" />结束
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component({
  name: 'PollingMask'
})
export default class extends Vue {
  /* 轮巡及一键播放 */
  @Prop({ default: 'free' })
  private pollingStatus: string

  private pollingInterval = [
    {
      value: 5,
      label: '5秒'
    },
    {
      value: 10,
      label: '10秒'
    },
    {
      value: 20,
      label: '20秒'
    },
    {
      value: 40,
      label: '40秒'
    },
    {
      value: 60,
      label: '1分钟'
    },
    {
      value: 180,
      label: '3分钟'
    },
    {
      value: 300,
      label: '5分钟'
    },
    {
      value: 600,
      label: '10分钟'
    },
    {
      value: 1800,
      label: '30分钟'
    }
  ]

  /* 轮询配置 */
  private polling = {
    interval: 20,
    isLoading: false
  }

  private pollingHandle(val) {
    this.$emit('polling-handle', val)
  }

  private intervalChange(val: number) {
    this.$emit('polling-handle', 'intervalChange', val)
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
