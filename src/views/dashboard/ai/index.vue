<template>
  <div :class="isLight? 'light-dashboard-wrap' :'dashboard-wrap'">
    <div v-if="isLight" class="light-btns">
      <el-dropdown v-for="group in aiGroups" :key="group.name" trigger="click" placement="bottom-start" @command="goRouter">
        <el-button>{{ group.name }}<i class="el-icon-arrow-down el-icon--right" /></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="aiType in group.children" :key="aiType" :command="aiType">{{ alertType[aiType] }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
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
              <el-tooltip content="点击放大">
                <div class="ai-recognation__images__item__img--wrap ai-recognation__images__item__img--wrap--left" @click="fullscreenImage()">
                  <img v-if="currentImg" class="ai-recognation__images__item__img" :src="currentImg && currentImg.url">
                  <!-- <img :src="require('@/assets/dashboard/image-placeholder.png')"> -->
                  <Locations :type="type" :img="currentImg" />
                  <div v-if="currentImg" class="ai-recognation__images__item--datetime">{{ currentImg && currentImg.deviceName }} | {{ currentImg && currentImg.timestamp }}</div>
                </div>
              </el-tooltip>
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
                <!-- <img :src="require('@/assets/dashboard/image-placeholder.png')"> -->
                <Locations :type="type" :img="img" />
                <div class="ai-recognation__images__item--datetime">{{ img.timestamp }}</div>
              </div>
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
      :custom-class="`${isLight ? 'light-' : ''}ai-image-fullscreen`"
      @close="dialog.fullscreen = false"
    >
      <div slot="title">{{ currentImg && currentImg.deviceName }} | {{ currentImg && currentImg.timestamp }}</div>
      <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img">
        <div class="ai-recognation__images__item__img--wrap ai-image-fullscreen__img--wrap">
          <img v-if="currentImg" :src="currentImg && currentImg.url">
          <Locations :type="type" :img="currentImg" :clickable="true" @click-location="onLocationChanged" />
        </div>
        <Attributes v-if="type === '12'" class="ai-image-fullscreen__img--attributes" :type="type" :img="currentImg" :attributes-index="currentLocationIndex" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getRecordAuditEvents } from '@/api/dashboard'
import { AlertType } from '@/dics'
import { parseMetaData, transformLocation } from '@/utils/ai'
import Locations from './components/Locations.vue'
import Attributes from './components/Attributes.vue'
import { AiGroups } from '../helper/aiGroups'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DashboardAI',
  components: {
    Locations,
    Attributes
  }
})
export default class extends Vue {
  private alertType = AlertType
  private aiGroups = AiGroups
  private currentImg: any = null
  private currentLocationIndex: number = -1
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

  @Watch('imageList.length')
  private onImageListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private get type() {
    let params: any = this.$route.query
    return params.type.toString()
  }

  private get isLight() {
    return this.$route.query.isLight
  }

  private mounted() {
    this.getRecordAuditEvents()
    // TODO: Hardcode 300015
    if (UserModule.mainUserID === '300015') {
      this.aiGroups = [
        {
          name: '人脸识别',
          children: [4]
        }, {
          name: '人体识别',
          children: [8]
        }, {
          name: '场景识别',
          children: [10, 17]
        }
      ]
    }
  }

  private goRouter(type: any) {
    let params: any = {
      path: '/dashboard/ai',
      query: {
        type,
        isLight: true
      }
    }
    this.$router.push(params)
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
    this.$set(this.imageList[index], 'locations', transformLocation(locations, img))
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

  private onLocationChanged(index: number) {
    this.currentLocationIndex = index
  }
}
</script>

<style lang="scss" scoped>
  $lightColor: #ccc;
  $lightFont: #4c4c4c;

  .light-btns {
    margin: 3vh 5vh;

    .el-dropdown {
      margin-right: 15px;
    }
  }

  .light-dashboard-wrap {
    background-color: #f6f6f6;

    .ai-recognation {
      margin: 0 5vh;
      border: 2px solid $lightColor;

      &__empty {
        color: $lightFont;
      }

      &__decorator--top,
      &__decorator--bottom {
        &:before,
        &:after {
          border: 7px solid $lightColor;
        }
      }

      &__decorator--top {
        top: -3px;

        &:before {
          border-right: 0;
          border-bottom: 0;
        }

        &:after {
          right: -8px;
          border-left: 0;
          border-bottom: 0;
        }
      }

      &__decorator--bottom {
        bottom: -3px;

        &:before,
        &:after {
          bottom: -3px;
        }

        &:before {
          border-right: 0;
          border-top: 0;
        }

        &:after {
          right: -8px;
          border-left: 0;
          border-top: 0;
        }
      }

      &__title {
        margin: 20px 0;

        img {
          display: none;
        }

        &--text {
          color: $lightFont;
          left: 1vw;
        }
      }

      &__video {
        border: 1px solid $lightColor;

        &__loading {
          color: $lightFont;
        }
      }

      &__images {
        &__item {
          border: 1px solid $lightColor;
          border-left: 5px solid $lightColor;
          border-right: 5px solid $lightColor;

          &__count {
            color: $lightFont;
          }

          &__decorator--top,
          &__decorator--bottom {
            &:before,
            &:after {
              border-top: 7px solid $lightColor;
            }
          }

          &--datetime {
            color: #ccc;
            background: rgba(100, 100, 100, 40%);
          }

          &__tools {
            color: $lightFont;
          }
        }
      }

      &__bottom {
        &--fresh {
          background: $primary;
          color: #fff;
        }

        .el-pagination {
          ::v-deep .el-pager li,
          ::v-deep .btn-prev,
          ::v-deep .btn-next {
            color: $lightFont;
          }
        }
      }
    }
  }

  .dashboard-wrap {
    position: relative;
    background-color: #070f2e;
    height: 100%;
    width: 100%;
    font-size: 16px;
    height: 100vh;
    overflow: auto;

    ::v-deep .el-loading-mask {
      background: rgba(35, 59, 88, 60%);
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

      &:before,
      &:after {
        position: absolute;
        display: block;
        content: ' ';
        width: 10vh;
        height: 10vh;
        border: 7px solid #0187ee;
      }

      &:before {
        left: -1px;
      }

      &:after {
        right: -8px;
      }
    }

    &__decorator--top {
      top: -3px;

      &:before {
        border-right: 0;
        border-bottom: 0;
      }

      &:after {
        right: -8px;
        border-left: 0;
        border-bottom: 0;
      }
    }

    &__decorator--bottom {
      bottom: -3px;

      &:before,
      &:after {
        bottom: -3px;
      }

      &:before {
        border-right: 0;
        border-top: 0;
      }

      &:after {
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
        background: rgba(20, 34, 51, 90%);
      }

      img {
        width: 100%;
      }

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

    &__images__wrap {
      flex: 2;
      display: flex;
      flex-direction: column;
    }

    &__images {
      display: grid;
      grid-gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));

      &__item {
        position: relative;
        margin: 1%;
        border: 1px solid #0187ee;
        border-left: 5px solid #0187ee;
        border-right: 5px solid #0187ee;
        padding: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;

        &__wrap {
          position: relative;
          width: 100%;
        }

        &__img--wrap {
          position: relative;
          width: 100%;

          &--left {
            cursor: pointer;
          }
        }

        &__img {
          width: 100%;
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

        &--datetime {
          position: absolute;
          z-index: 2;
          color: #eee;
          font-size: 12px;
          text-align: right;
          right: 10px;
          bottom: 10px;
          background: rgba(0, 0, 0, 80%);
          padding: 5px 10px;
        }

        &__tools {
          color: #fff;
          text-align: right;
          margin: 5px 10px 0 0;

          &--zoomin {
            cursor: pointer;
          }
        }

        img {
          width: 100%;
          display: block;
        }

        &:hover,
        &.actived {
          border-color: $primary;

          .ai-recognation__images__item__decorator--top,
          .ai-recognation__images__item__decorator--bottom {
            &:after,
            &:before {
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

        ::v-deep .el-pager li,
        ::v-deep .btn-prev,
        ::v-deep .btn-next {
          background: none;
          color: #fff;
        }

        ::v-deep .el-pager li.active {
          color: $primary;
        }
      }
    }
  }

  .ai-image-fullscreen__img {
    display: flex;

    &--wrap {
      flex: 4;
    }

    &--attributes {
      flex: 1;
      background: #f7f7f7;
      padding: 20px 15px;
    }

    img {
      width: 100%;
    }
  }
</style>
