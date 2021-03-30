<template>
  <div class="dashboard-wrap">
    <div class="ai-recognation">
      <div class="ai-recognation__decorator--top" />
      <div class="ai-recognation__decorator--bottom" />
      <div class="ai-recognation__body">
        <div class="ai-recognation--left">
          <div class="ai-recognation__title">
            <img :src="require('@/assets/dashboard/title-bg.svg')">
            <div class="ai-recognation__title--text">
              {{ alertType[type] }}
            </div>
          </div>
          <div class="ai-recognation__video">
            <div v-if="false" class="ai-recognation__video__loading">正在加载视频...</div>
            <div class="ai-recognation__images__item__wrap">
              <img v-if="currentImg" class="ai-recognation__images__item__img" :src="currentImg && currentImg.url">
              <img :src="require('@/assets/dashboard/image-placeholder.png')">
              <div
                v-for="(location, locationIndex) in currentImg && currentImg.locations"
                :key="locationIndex"
                class="ai-recognation__images__item__mask"
                :class="{'ai-recognation__images__item__mask--warning': location.isWarning}"
                :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
              >
                <div v-if="type === '6'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
                  {{ aiMaskType[location.type] }}
                </div>
                <div v-if="type === '4'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
                  匹配度:{{ location.score }}%
                </div>
                <!-- <div v-if="type === '3'" class="ai-recognation__images__item__mask__text ai-recognation__images__item__mask__text--warning">
                  {{ location.label }}
                </div> -->
              </div>
              <div v-if="type === '8' && currentImg" class="ai-recognation__images__item__count" :class="{'ai-recognation__images__item__count--warning': currentImg && currentImg.locations && currentImg.locations.length > 10}">聚集人数: {{ currentImg && currentImg.locations && currentImg.locations.length || '-' }}</div>
              <div v-if="currentImg" class="ai-recognation__images__item--datetime">{{ currentImg && currentImg.deviceName }} | {{ currentImg && currentImg.timestamp }}</div>
              <div class="ai-recognation__images__item__tools">
                <div class="ai-recognation__images__item__tools--zoomin" @click="fullscreenImage()">
                  <svg-icon name="zoom-in" width="14px" height="14px" />
                </div>
              </div>
            </div>
            <player
              v-if="currentVideo"
              :type="currentVideo.type"
              :url="currentVideo.url"
              :is-live="false"
              :is-ws="false"
              :has-fullscreen="false"
              :auto-play="true"
              :has-control="false"
              :has-playback="true"
            />
          </div>
        </div>
        <div class="ai-recognation__images__wrap">
          <div v-if="!loading.list && !imageList.length" class="ai-recognation__empty">暂无{{ alertType[type] }}告警</div>
          <div v-if="loading.list || imageList.length" v-loading="loading.list" class="ai-recognation__images">
            <div v-for="(img, index) in imageList" :key="index" class="ai-recognation__images__item" :class="{'actived': currentImg && img.timestamp === currentImg.timestamp && img.streamName === currentImg.streamName}" @click="getRecordAudits(img)">
              <div class="ai-recognation__images__item__decorator--top" />
              <div class="ai-recognation__images__item__decorator--bottom" />
              <div class="ai-recognation__images__item__wrap">
                <img ref="img" class="ai-recognation__images__item__img" :src="img.url" @load="onload(index)">
                <img :src="require('@/assets/dashboard/image-placeholder.png')">
                <div
                  v-for="(location, locationIndex) in img.locations"
                  :key="locationIndex"
                  class="ai-recognation__images__item__mask"
                  :class="{'ai-recognation__images__item__mask--warning': location.isWarning}"
                  :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
                >
                  <div v-if="type === '6'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
                    {{ aiMaskType[location.type] }}
                  </div>
                  <div v-if="type === '4'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
                    匹配度:{{ location.score }}%
                  </div>
                  <!-- <div v-if="type === '3'" class="ai-recognation__images__item__mask__text ai-recognation__images__item__mask__text--warning">
                    {{ location.label }}
                  </div> -->
                </div>
                <div v-if="type === '8'" class="ai-recognation__images__item__count" :class="{'ai-recognation__images__item__count--warning': img.locations && img.locations.length > 10}">聚集人数: {{ img.locations && img.locations.length || '-' }}</div>
              </div>
              <div class="ai-recognation__images__item--datetime">{{ img.timestamp }}</div>
            </div>
          </div>
          <div v-if="imageList.length" class="ai-recognation__bottom">
            <el-button class="ai-recognation__bottom--fresh" @click="getRecordAuditEvents">刷新当前页</el-button>
            <el-pagination
              :current-page="pager.pageNum"
              :page-size="pager.pageSize"
              :total="pager.total"
              layout="prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-if="dialog.fullscreen"
      :visible="true"
      :fullscreen="true"
      custom-class="ai-image-fullscreen"
      @close="dialog.fullscreen = false"
    >
      <div slot="title">{{ currentImg && currentImg.deviceName }} | {{ currentImg && currentImg.timestamp }}</div>
      <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img">
        <img v-if="currentImg" :src="currentImg && currentImg.url">
        <div
          v-for="(location, locationIndex) in currentImg && currentImg.locations"
          :key="locationIndex"
          class="ai-recognation__images__item__mask"
          :class="{'ai-recognation__images__item__mask--warning': location.isWarning}"
          :style="`top:${location.clientTopPercent}%; left:${location.clientLeftPercent}%; width:${location.clientWidthPercent}%; height:${location.clientHeightPercent}%;`"
        >
          <div v-if="type === '6'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
            {{ aiMaskType[location.type] }}
          </div>
          <div v-if="type === '4'" class="ai-recognation__images__item__mask__text" :class="{'ai-recognation__images__item__mask__text--warning': location.isWarning}">
            匹配度:{{ location.score }}%
          </div>
          <!-- <div v-if="type === '3'" class="ai-recognation__images__item__mask__text ai-recognation__images__item__mask__text--warning">
            {{ location.label }}
          </div> -->
        </div>
        <div v-if="type === '2' && currentImg" class="ai-recognation__images__item__count" :class="{'ai-recognation__images__item__count--warning': currentImg && currentImg.locations && currentImg.locations.length > 10}">聚集人数: {{ currentImg && currentImg.locations && currentImg.locations.length || '-' }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getRecordAuditEvents } from '@/api/dashboard'
import { AlertType, AiMaskType } from '@/dics'
import { parseMetaData } from '@/utils/ai'
import Player from '@/views/device/components/Player.vue'

@Component({
  name: 'DashboardAI',
  components: {
    Player
  }
})
export default class extends Vue {
  private alertType = AlertType
  private aiMaskType = AiMaskType
  private currentImg: any = null
  private currentVideo: any = null
  private pager = {
    pageNum: 1,
    pageSize: 9,
    total: 20
  }
  private loading = {
    list: false,
    video: false
  }
  private dialog = {
    fullscreen: false
  }
  private imageList = []

  private get type() {
    let params: any = this.$route.query
    return params.type.toString()
  }

  private mounted() {
    this.getRecordAuditEvents()
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.currentImg = null
    this.pager.pageNum = 1
    this.imageList = []
    this.getRecordAuditEvents()
  }

  private async getRecordAuditEvents() {
    try {
      this.loading.list = true
      const res = await getRecordAuditEvents({
        event: this.type,
        pageSize: this.pager.pageSize,
        pageNum: this.pager.pageNum
      })
      this.imageList = res.imgs
      this.pager.total = res.totalNum
      if (this.imageList.length) {
        this.getRecordAudits(this.imageList[0])
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.list = false
    }
  }

  private async getRecordAudits(audit: any) {
    try {
      this.currentVideo = null
      this.currentImg = audit
      this.loading.video = true
      // const res = await getRecordAudits({
      //   event: this.type,
      //   streamName: audit.streamName,
      //   timeStamp: audit.timestamp
      // })
      // this.currentVideo = {
      //   url: res.playUrl,
      //   type: res.codec === 'CodecH265' ? 'h265-flv' : 'flv'
      // }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.video = false
    }
  }

  private onload(index: number) {
    if (!this.imageList || !this.imageList.length) {
      return
    }
    const imgData: any = this.imageList[index]
    const metaData = JSON.parse(imgData.metaData)
    const locations = parseMetaData(this.type, metaData)
    const imgs: any = this.$refs.img
    const img = imgs[index]
    locations && locations.forEach((location: any) => {
      const ratio = img.clientWidth / img.naturalWidth
      location.clientTopPercent = location.top * ratio / img.clientHeight * 100
      location.clientLeftPercent = location.left * ratio / img.clientWidth * 100
      location.clientWidthPercent = location.width * ratio / img.clientWidth * 100
      location.clientHeightPercent = location.height * ratio / img.clientHeight * 100
    })
    this.$set(this.imageList[index], 'locations', locations)
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getRecordAuditEvents()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getRecordAuditEvents()
  }

  private fullscreenImage() {
    this.dialog.fullscreen = true
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    position: relative;
    background-color: #070f2e;
    height: 100%;
    width: 100%;
    font-size: 16px;
    height: 100vh;
    overflow: auto;

    ::v-deep .el-loading-mask {
      background: rgba(35, 59, 88, 0.6);
    }
  }
  .ai-recognation {
    border: 2px solid #0185ea;
    margin: 8vh 5vh;
    padding: 2vh;
    position: relative;

    &__empty {
      color: #fff;
      text-align: center;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // Decorator
    &__decorator--top,
    &__decorator--bottom {
      position: absolute;
      left: -3px;
      width: 100%;
      &::before, &::after {
        position: absolute;
        display: block;
        content: ' ';
        width: 10vh;
        height: 10vh;
        border: 7px solid #0187ee;
      }
      &::before {
        left: -1px;
      }
      &::after {
        right: -8px;
      }
    }
    &__decorator--top {
      top: -3px;
      &::before {
        border-right: 0;
        border-bottom: 0;
      }
      &::after {
        right: -8px;
        border-left: 0;
        border-bottom: 0;
      }
    }
    &__decorator--bottom {
      bottom: -3px;
      &::before, &::after {
        bottom: -3px;
      }
      &::before {
        border-right: 0;
        border-top: 0;
      }
      &::after {
        right: -8px;
        border-left: 0;
        border-top: 0;
      }
    }

    &__body {
      display: flex;
    }
    &--left {
      display: flex;
      flex: 1;
      margin: 0.7%;
      flex-direction: column;
    }
    &__title {
      position: relative;
      img {
        display: block;
      }
      &--text {
        position: absolute;
        top: 0;
        right: 1vw;
        font-size: 1.5vw;
        letter-spacing: 0.1em;
        display: flex;
        align-items: center;
        height: 100%;
        color: #fff;
      }
    }
    &__video {
      position: relative;
      flex: 1;
      margin-top: 2vh;
      border: 1px solid #0187ee;
      min-height: 30vh;
      display: flex;
      align-items: center;
      &__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -150px;
        font-size: 18px;
        color: #7baee0;
        width: 300px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        background: rgba(20, 34, 51, 0.9);
      }
      img {
        width: 100%;
      }
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
    &__images__wrap {
      flex: 2;
      display: flex;
      flex-direction: column;
    }
    &__images {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      &__item {
        position: relative;
        width: 31%;
        margin: 1%;
        border: 1px solid #0187ee;
        border-left: 5px solid #0187ee;
        border-right: 5px solid #0187ee;
        padding: 10px;
        cursor: pointer;
        &__wrap {
          position: relative;
          width: 100%;
        }
        &__img {
          position: absolute;
          top: 0;
          width: 100%;
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
            border-top: 7px solid #0187ee;
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

        &--datetime {
          position: absolute;
          color: #eee;
          font-size: 12px;
          text-align: right;
          right: 10px;
          bottom: 10px;
          background: rgba(0, 0, 0, 0.8);
          padding: 5px 10px;
        }
        &__tools {
          position: absolute;
          color: #fff;
          right: 10px;
          bottom: -20px;
          &--zoomin {
            cursor: pointer;
          }
        }
        img {
          width: 100%;
          display: block;
        }

        &:hover, &.actived {
          border-color: $primary;
          .ai-recognation__images__item__decorator--top,
          .ai-recognation__images__item__decorator--bottom {
            &::after, &::before {
              border-color: $primary;
            }
          }
        }
      }
    }

    &__bottom {
      display: flex;
      margin: 0 1%;
      justify-content: space-between;
      align-items: center;

      &--fresh {
        background: #0185ea;
        border: none;
        padding: 15px 20px;
        color: #fff;
        &:hover {
          background: $primary;
        }
      }

      .el-pagination {
        position: relative;
        margin: 0;
        z-index: 100;
        ::v-deep .el-pager li, ::v-deep .btn-prev, ::v-deep  .btn-next {
          background: none;
          color: #fff;
        }
        ::v-deep .el-pager li.active {
          color: $primary;
        }
      }
    }
  }
  .ai-image-fullscreen__img img {
    width: 100%;
  }
</style>
