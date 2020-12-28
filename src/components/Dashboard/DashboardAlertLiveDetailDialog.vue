<template>
  <el-dialog
    title="告警详情"
    :custom-class="theme"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="70%"
    center
    @close="closeDialog"
  >
    <div v-loading="loading" class="alert" :class="theme">
      <div class="alert-header">
        <div class="alert-header__type">事件类型: {{ alertType[audit.event] }}</div>
        <div class="alert-header__datetime">{{ audit.timestamp }}</div>
      </div>
      <div v-if="auditDetail" class="alert-body">
        <div class="alert-body__video">
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
        </div>
        <div class="alert-body__image">
          <div class="alert-body__image__decorator--top" />
          <div class="alert-body__image__decorator--bottom" />
          <div class="alert-body__image__wrap">
            <img ref="img" :src="auditDetail.imgUrl" @load="onload">
            <div
              v-for="(location, locationIndex) in auditDetail.locations"
              :key="locationIndex"
              class="alert-body__image__mask"
              :class="{'alert-body__image__mask--warning': location.isMask}"
              :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
            />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getRecordAudits } from '@/api/dashboard'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import { parseMetaData } from '@/utils/ai'
import Player from '@/views/device/components/Player.vue'

@Component({
  name: 'AlertBoardDetailDialog',
  components: {
    Player
  }
})
export default class extends Vue {
  private audit: any = {
    timestamp: '2020-12-27 13:57:12',
    streamName: '29942045602742559',
    event: '1'
  }
  @Prop() private theme: any
  private alertType = AlertType
  private alertLevel = AlertLevel
  private alertIcon = AlertIcon
  private dialogVisible = true
  private auditDetail: any = null
  private loading = false

  private mounted() {
    this.getRecordAudits()
  }

  private async getRecordAudits() {
    try {
      this.loading = true
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
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private onload() {
    console.log(this.auditDetail.metaData)
    const metaData = JSON.parse(this.auditDetail.metaData)
    const img: any = this.$refs.img
    const locations = parseMetaData(this.audit.event, metaData)
    locations.forEach((location: any) => {
      location.ratio = img.clientWidth / img.naturalWidth
      location.clientTopPercent = location.top * location.ratio / img.clientHeight * 100
      location.clientLeftPercent = location.left * location.ratio / img.clientWidth * 100
      location.clientWidthPercent = location.width * location.ratio / img.clientWidth * 100
      location.clientHeightPercent = location.height * location.ratio / img.clientHeight * 100
    })
    this.$set(this.auditDetail, 'locations', locations)
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .alert {
    min-height: 10vh;
  }
  .alert-header {
    display: flex;
    width: 100%;

    &__level {
      &--warning {
        color: #F4C46C;
      }
      &--alert {
        color: #E56161;
      }
      margin-right: 10px;
    }
    &__datetime {
      flex: 1;
      text-align: right;
    }
  }

  .alert-body {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid $borderGrey;
    margin-top: 15px;
    padding-top: 15px;
    max-height: 60vh;
    overflow: auto;

    &__video {
      position: relative;
      flex: 1;
      margin-right: 20px;
      ::v-deep .video-wrap, ::v-deep video {
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
      border: 1px solid #516F8D;
      border-left: 5px solid #648fb9;
      border-right: 5px solid #648fb9;
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
      }
      // Decorator
      &__decorator--top,
      &__decorator--bottom {
        position: absolute;
        width: 100%;
        left: 0;
        &::before, &::after {
          position: absolute;
          display: block;
          content: ' ';
          width: 10px;
          border-top: 7px solid #648fb9;
        }
        &::before {
          left: 0;
        }
        &::after {
          right: 0;
        }
      }
      &__decorator--top {
        top: 0px;
      }
      &__decorator--bottom {
        bottom: 7px;
      }
      img {
        width: 100%;
      }
    }
  }

  .dashboard-alert-live-dialog {
    .alert-body {
      border-top: 1px solid #6086a6;
    }
  }
</style>
