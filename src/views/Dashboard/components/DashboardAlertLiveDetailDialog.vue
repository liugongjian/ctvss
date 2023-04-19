<template>
  <el-dialog
    title="告警详情"
    :custom-class="!isLight ? theme : ''"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="50%"
    center
    @close="closeDialog"
  >
    <div v-loading="loading" class="alert" :class="{ theme: true, 'light-alert': isLight }">
      <div class="alert-header">
        <div class="alert-header__type">事件类型: {{ alertType[audit.event] }}</div>
        <el-tooltip class="item" effect="dark" :content="deviceNameAndChannelFull" placement="bottom">
          <div class="alert-header__device">设备: {{ deviceNameAndChannel }}</div>
        </el-tooltip>
        <div class="alert-header__device">应用: {{ audit.appName || '无' }}</div>
        <div class="alert-header__datetime">时间:{{ audit.timestamp }}</div>
      </div>
      <div v-if="error" class="alert-error">{{ error }}</div>
      <div v-if="audit" class="alert-body">
        <!-- <div class="alert-body__video">
          <player
            :type="auditDetail.type"
            :url="auditDetail.videoUrl"
            :is-live="false"
            :is-ws="false"
            :has-fullscreen="false"
            :auto-play="true"
            :has-control="false"
            :has-playback="true"
          />
        </div> -->
        <div class="alert-body__image">
          <div class="alert-body__image__decorator--top" />
          <div class="alert-body__image__decorator--bottom" />
          <div class="alert-body__image__wrap">
            <img ref="img" :src="audit.url" @load="onload">
            <Locations :type="audit.event" :img="audit" />
          </div>
        </div>
      </div>
      <div v-if="confirm" class="alert-footer alert-buttons">
        <el-button type="success" :loading="confirming" @click="auditEventConfirm">确认正常</el-button>
        <el-button type="danger" @click="closeDialog">异常挂起</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getRecordAudits, auditEventConfirm } from '@/api/dashboard'
import { AlertType, AlertLevel, AlertIcon, AiMaskType } from '@/dics'
import { parseMetaData, transformLocation } from '@/utils/ai'
import Locations from '@/views/Dashboard/AI/components/Locations.vue'

@Component({
  name: 'AlertBoardDetailDialog',
  components: {
    Locations
  }
})
export default class extends Vue {
  @Prop() private audit: any
  @Prop() private theme: any
  @Prop({
    default: false
  })
  private confirm: any
  private alertType = AlertType
  private alertLevel = AlertLevel
  private alertIcon = AlertIcon
  private aiMaskType = AiMaskType
  private dialogVisible = true
  private auditDetail: any = null
  private loading = false
  private confirming = false
  private error: any = null
  @Prop({ default: false })
  private isLight?: boolean

  private mounted() {
    // this.getRecordAudits()
  }

  get deviceNameAndChannel() {
    let temp: string
    if (this.audit.channelName && this.audit.channelName !== this.audit.deviceName) {
      temp = this.audit.deviceName + '-' + this.audit.channelName
    } else {
      temp = this.audit.deviceName
    }
    return temp.length > 5 ? temp.slice(0, 5) + '...' : temp
  }

  get deviceNameAndChannelFull() {
    if (this.audit.channelName && this.audit.channelName !== this.audit.deviceName) {
      return this.audit.deviceName + '-' + this.audit.channelName
    } else {
      return this.audit.deviceName
    }
  }
  /**
   * 正常确认
   */
  private async auditEventConfirm() {
    try {
      this.confirming = true
      await auditEventConfirm({
        event: this.audit.event,
        streamName: this.audit.streamName,
        timestamp: this.audit.timestamp,
        confirm: 1
      })
      this.closeDialog(true)
      this.$alertSuccess('确认成功')
    } catch (e) {
      this.$alertError('确认失败')
    } finally {
      this.confirming = false
    }
  }

  private async getRecordAudits() {
    try {
      this.loading = true
      this.error = null
      const res = await getRecordAudits({
        event: this.audit.event,
        streamName: this.audit.streamName,
        timeStamp: this.audit.timestamp
      })
      if (res.imgs.length) {
        this.auditDetail = {
          imgUrl: res.imgs[0].url,
          metaData: res.imgs[0].metaData,
          videoUrl: res.playUrl,
          type: res.codec === 'CodecH265' ? 'h265-flv' : 'flv'
        }
      }
    } catch (e) {
      this.error = '加载失败，请关闭重试'
    } finally {
      this.loading = false
    }
  }

  private onload() {
    const metaData = JSON.parse(this.audit.metaData)
    const img: any = this.$refs.img
    const locations = parseMetaData(this.audit.event, metaData)
    this.$set(this.audit, 'locations', transformLocation(locations, img))
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  $lightColor: #ccc;

  .light-alert {
    .alert-header {
      border-bottom: 1px solid $lightColor;
    }

    .alert-body {
      &__image {
        border: 1px solid $lightColor;
        border-left: 5px solid $lightColor;
        border-right: 5px solid $lightColor;

        &__mask {
          &__count {
            color: $text;
          }
        }

        &__decorator--top,
        &__decorator--bottom {
          position: absolute;
          width: 100%;
          left: 0;

          &:before,
          &:after {
            border-top: 7px solid $lightColor;
          }

          &:before {
            left: 0;
          }

          &:after {
            right: 0;
          }
        }
      }
    }

    .dashboard-alert-live-dialog {
      .alert-body {
        border-top: 1px solid #6086a6;
      }
    }
  }

  .alert {
    min-height: 10vh;
  }

  .alert-error {
    margin-top: 10px;
    text-align: center;
  }

  .alert-header {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #0187ee;
    margin-bottom: 15px;
    padding-bottom: 15px;

    &__level {
      &--warning {
        color: #f4c46c;
      }

      &--alert {
        color: #e56161;
      }

      margin-right: 10px;
    }

    &__device {
      flex: 1;
      text-align: center;
    }

    &__datetime {
      flex: 1;
      text-align: right;
    }
  }

  .alert-body {
    display: flex;
    flex-wrap: wrap;
    max-height: 60vh;
    overflow: auto;

    &__video {
      position: relative;
      flex: 1;
      margin-right: 20px;

      ::v-deep .video-wrap,
      ::v-deep video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      ::v-deep canvas {
        position: absolute;
      }
    }

    &__image {
      flex: 1;
      position: relative;
      border: 1px solid #0187ee;
      border-left: 5px solid #0187ee;
      border-right: 5px solid #0187ee;
      padding: 20px;

      &__wrap {
        position: relative;

        img {
          width: 100%;
          display: block;
        }
      }

      &__mask {
        position: absolute;
        border: 2px solid $dashboardGreen;

        &--warning {
          border-color: $red;
        }

        &__text {
          position: absolute;
          display: block;
          font-size: 11px;
          background: $dashboardGreen;
          color: #000;
          word-break: keep-all;
          bottom: -19px;
          left: -2px;
          padding: 2px;
          opacity: 0.8;

          &--warning {
            background: $white;
          }
        }

        &__count {
          position: absolute;
          top: 0;
          left: 0;
          background: $dashboardGreen;
          color: #fff;
          font-size: 12px;
          padding: 3px 6px;

          &--warning {
            background: $red;
          }
        }
      }
      // Decorator
      &__decorator--top,
      &__decorator--bottom {
        position: absolute;
        width: 100%;
        left: 0;

        &:before,
        &:after {
          position: absolute;
          display: block;
          content: ' ';
          width: 10px;
          border-top: 7px solid #0187ee;
        }

        &:before {
          left: 0;
        }

        &:after {
          right: 0;
        }
      }

      &__decorator--top {
        top: 0;
      }

      &__decorator--bottom {
        bottom: 7px;
      }

      img {
        width: 100%;
      }
    }
  }

  .alert-buttons {
    margin-top: 10px;
    text-align: center;
  }

  .dashboard-alert-live-dialog {
    .alert-body {
      border-top: 1px solid #6086a6;
    }
  }
</style>
