<template>
  <div>
    <div>
      <div class="query-wrapper">
        <span>时段：
          <el-radio-group v-model="queryParam.periodType" size="medium" @change="handleChange">
            <el-radio-button label="今天" />
            <el-radio-button label="近3天" />
            <el-radio-button label="自定义时间" />
          </el-radio-group>
          <el-date-picker
            v-if="queryParam.periodType === '自定义时间'"
            v-model="queryParam.period"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="handleChange"
          />
        </span>
        <span>视图信息对象：
          <div class="time-interval">
            <el-select v-model="queryParam.viewType" placeholder="请选择" @change="handleChange">
              <el-option
                v-for="type in viewTypes"
                :key="type.value"
                :label="type.cname"
                :value="type.value"
              />
            </el-select>
          </div>
        </span>
        <span>
          <el-button class="el-button-rect" :disabled="dataLoading" @click="refresh"><svg-icon name="refresh" /></el-button>
        </span>
      </div>
      <div v-loading="queryLoading.pic" class="pic-wrapper">
        <div class="title">
          <div class="title-block" />
          <span>视频截图</span>
        </div>
        <div v-if="picInfos.length > 0 && !queryLoading.pic" class="card-wrapper">
          <ViewCard
            v-for="(pic, index) in picInfos"
            :id="index"
            :key="index"
            :pic="pic"
            @showDialogue="showDialogue"
          />
        </div>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :page-sizes="[12,24,36,48,60]"
          :total="pager.totalNum"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <el-dialog
        v-if="visibile"
        :visible="visibile"
        :fullscreen="true"
        :custom-class="`light-ai-image-fullscreen`"
        @close="dialogueOprate"
      >
        <div class="dialogue-wrapper">
          <div class="dialogue-left">
            <div class="dialogue-left__pic">
              <el-carousel
                ref="carousel"
                trigger="click"
                arrow="always"
                :loop="false"
                :autoplay="false"
                @change="changeCarousel"
              >
                <el-carousel-item v-for="(pic,index) in picInfos" :key="pic.id" :name="index+''">
                  <img :src="pic.image" :alt="pic.id">
                </el-carousel-item>
              </el-carousel>
            </div>
            <div ref="picListWrapper" class="dialogue-left__list" @mousewheel.stop="scrollPicList">
              <div ref="picList" class="infinite-list-wrapper" style="overflow: auto;">
                <ul
                  class="list"
                  infinite-scroll-disabled="disabled"
                  :style="`width:${300 * picInfos.length}px`"
                >
                  <li
                    v-for="(pic,index) in picInfos"
                    :key="index"
                    class="list-item"
                    :class="`${activeIndex === index ? 'active' : ''}`"
                    @click="active(index)"
                  >
                    <img :src="pic.image" alt="">
                      <el-tooltip effect="dark" :content="pic.id" placement="bottom">
                        <div>sourceId:{{ (pic.id && pic.id.length > 5) ? pic.id.slice(0,5) + '...' : pic.id }}</div>
                      </el-tooltip>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="dialogue-right">
            <div class="dialogue-right__section">
              <div class="dialogue-right__section__title">基础信息</div>
              <el-descriptions :column="1" label-class-name="desc" :label-style="{'font-weight': 'bold', color: 'black'}">
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
              </el-descriptions>
            </div>
            <div class="dialogue-right__section">
              <div class="dialogue-right__section__title">图像列表</div>
              <el-descriptions :column="1" label-class-name="desc" :label-style="{'font-weight': 'bold', color: 'black'}">
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
                <el-descriptions-item label="人脸标识">{{ picInfos[activeIndex].id }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import ViewCard from './ViewCard.vue'
import debounce from '@/utils/debounce'
import { ViewTypes } from '@/dics/index'

const sr = 'https://guiyang.vcn.ctyun.cn/vss-resource03_ai_wgw1-1/29942159419407308/ai/2022-05-20/20220520-144551-af4a63ee-a1d2-45c5-b81d-c90fd188cded.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=QK3UOU50KUN39XM4L3E1%2F20220520%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220520T065433Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=254df84025683a739a6a9bcc40d0e4c3136692185e0643dc893059fab625110b'

@Component({
  name: 'DetailViewLib',
  components: {
    ViewCard
  }
})
export default class extends Vue {
  @Prop() private deviceId!: any
  @Prop() private inProtocol!: any

  private viewTypes = ViewTypes
  private picInfos = [{ image: sr, id: '123', time: 'xx' }, { image: sr, id: '423', time: 'xx' }, { image: sr, id: '22', time: 'xx' }, { image: sr, id: '53', time: 'xx' }, { image: sr, id: '31', time: 'xx' }, { image: sr, id: '3', time: 'xx' }, { image: sr, id: '332', time: 'xx' }, { image: sr, id: '1312', time: 'xx' }, { image: sr, id: '44232', time: 'xx' }, { image: sr, id: '74', time: 'xx' }, { image: sr, id: '37', time: 'xx' }, { image: sr, id: '32', time: 'xx' }, { image: sr, id: '77', time: 'xx' }]
  private queryLoading: any = {
    pic: false
  }
  private pager = {
    pageNum: 1,
    pageSize: 12,
    totalNum: 0
  }
  private queryParam: any = {
    periodType: '今天',
    period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
    viewType: 'all'
  }
  private visibile = false
  private activeIndex = 0

  private dialoguePic!: any
  // 防抖
  private debounceHandle = debounce(() => {
    Object.keys(this.queryLoading).forEach(key => { this.queryLoading[key] = true })
    // this.getScreenShot()
    // this.isCarFlowCode && this.getAlarmsList()
    Object.keys(this.queryLoading).forEach(key => { this.queryLoading[key] = false })
  }, 500)

  get dataLoading() {
    let loading = false
    Object.keys(this.queryLoading).forEach(key => {
      if (this.queryLoading[key]) {
        loading = true
      }
    })
    return loading
  }

  @Watch('queryParam.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.$set(this.queryParam, 'period', [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)])
        break
      case '近3天':
        this.$set(this.queryParam, 'period', [this.getDateBefore(2), new Date().setHours(23, 59, 59, 999)])
        break
      case '自定义时间':
        this.$set(this.queryParam, 'period', [this.getDateBefore(6), new Date().setHours(23, 59, 59, 999)])
        break
    }
  }

  private async mounted() {
    // this.getScreenShot()
  }

  /**
     * 得到N天前的时间戳
     */
  private getDateBefore(dayCount) {
    let dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    let time = dd.setHours(0, 0, 0)
    return time
  }

  private async initDeviceApp() {
  }

  /**
     * 拦截所有操作，并防抖发起查询请求
     */
  private handleChange() {
    this.debounceHandle()
  }
  /**
     * 分页操作
     */
  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getScreenShot()
  }
  /**
     * 分页操作
     */
  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getScreenShot()
  }

  /**
     * 分页操作
     */
  private handleChartTableCurrentChange(val: number) {
    this.chartPager.pageNum = val
  }

  private dialogueOprate() {
    this.visibile = !this.visibile
  }
  private showDialogue(pic, activeId) {
    this.visibile = true
    this.dialoguePic = pic
    this.$nextTick(() => {
      this.active(activeId)
      this.changeCarousel(activeId)
    })
  }
  private async refresh() {
    this.debounceHandle()
  }
  private scrollPicList(e) {
    // @ts-ignore
    this.$refs.picList.scrollLeft += e.deltaY > 0 ? 100 : -100
  }
  private active(index) {
    this.activeIndex = index
    // @ts-ignore
    this.$refs.carousel.setActiveItem(index)
  }

  private changeCarousel(active) {
    this.activeIndex = active
    // @ts-ignore
    const scrollLeft = this.$refs.picList.scrollLeft
    // @ts-ignore
    const wrapperWidth = this.$refs.picListWrapper.offsetWidth
    // 处理进度滚动
    if (active * 290 - wrapperWidth > scrollLeft || active * 290 < scrollLeft) {
      if (active !== 0) {
      // @ts-ignore
        this.$refs.picList.scrollLeft = Math.abs(active * 300 - wrapperWidth / 2)
      } else {
        // @ts-ignore
        this.$refs.picList.scrollLeft = 0
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.face-filter {
  margin-bottom: 20px;

  ::v-deep .el-descriptions-item__label {
    min-width: 48px !important;
  }

  .el-checkbox-group {
    padding-left: 55px;

    .el-checkbox {
      line-height: 63px;
      height: 84px;
      width: 200px;
      position: relative;
      padding: 0;
      margin: 0 58px 20px 0;

      ::v-deep .el-checkbox__input {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-41%);
      }

      ::v-deep .el-checkbox__label {
        position: absolute;
        padding: 0;
        width: 160px;
        height: 100%;
        vertical-align: middle;

        .checkbox-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          img {
            width: 50%;
            height: 100%;
          }

          div {
            width: 50%;
            text-align: center;
          }
        }
      }
    }
  }
}

.query-wrapper {
  // height: 36px;
  margin-bottom: 20px;
  line-height: 52px;

  & > span {
    margin-right: 20px;
  }

  .el-date-editor {
    margin-left: 10px;
    padding-top: 2px;
  }

  .confidence-slider {
    display: inline-block;
    line-height: 100%;
    vertical-align: middle;
    width: 11vw;
    margin-right: 20px;
    padding-left: 8px;
  }

  .time-interval {
    display: inline-block;
  }
}

.pic-wrapper {
  .card-wrapper {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    overflow-y: auto;
  }
}

.table-wrapper,
.chart-wrapper {
  display: inline-block;
  vertical-align: top;
}

.chart-wrapper {
  width: 100%;
}

.table-wrapper {
  width: 400px;
}

.title {
  height: 50px;
  vertical-align: middle;

  & > div {
    // display: inline-block;
    padding-top: 5px;
  }

  .title-block {
    width: 7px;
    height: 15px;
    background-color: rgba(250, 131, 52, 100%);
    border: none;
    margin-top: 2px;
    margin-right: 5px;
    display: inline-block;
  }

  span {
    font-weight: bold;
  }
}

.no-data {
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}

.ai-image-fullscreen__img {
  width: 100%;
  display: flex;

  &--wrap {
    position: relative;
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

.no-device {
  height: 70vh;
  color: rgba(186, 198, 198);
  line-height: 50vh;
  text-align: center;
  font-size: 25px;
}

.el-dialog__wrapper {
  ::v-deep .el-dialog__body,
  ::v-deep .el-dialog__header,
  ::v-deep .el-descriptions__body {
    // background: $subMenuBg !important;
  }
}

.dialogue-wrapper {
  display: flex;
  height: 100%;
}

::v-deep .el-dialog {
  overflow: hidden !important;
}

.dialogue-left {
  flex: 1 1 70vw;
  display: flex;
  flex-direction: column;

  &__op {
    color: black;
  }

  &__id {
    margin: 20px auto 5px;
    font-weight: bold;
  }

  &__pic {
    .el-carousel {
      width: 100%;
      padding: 0 30px;

      ::v-deep .el-carousel__arrow {
        background: none !important;
        font-size: 50px;

        i {
          color: black !important;
        }
      }

      ::v-deep .el-carousel__indicators {
        display: none;
      }

      ::v-deep &__container {
        height: 64vh;
      }

      &__item {
        display: flex;
        justify-content: center;
      }
    }
  }

  &__list {
    width: 80vw;
    height: fill-available;
    padding: 10px;

    .infinite-list-wrapper {
      padding-bottom: 5px;
    }

    .infinite-list-wrapper::-webkit-scrollbar {
      /* 滚动条整体样式 */
      width: 10px;  /* 高宽分别对应横竖滚动条的尺寸 */
      height: 10px;
    }

    .infinite-list-wrapper::-webkit-scrollbar-thumb {
      /* 滚动条里面小方块 */
      border-radius: 10px;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
      background: #ddd;
    }

    .infinite-list-wrapper::-webkit-scrollbar-track {
      /* 滚动条里面轨道 */
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
      border-radius: 20px;
      background: #fbfbfb;
    }

    ul {
      white-space: nowrap; //处理块元素中的空白符和换行符的，这个属性保证图片不换行
      .list-item {
        list-style: none;
        float: left;
        margin-right: 15px;
        width: 280px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        img {
          width: 100%;
        }
      }
    }
  }
}

.dialogue-right {
  flex: 1 1 15vw;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  overflow: auto;

  &__section {
    margin-bottom: 12%;
    padding: 10%;
    width: 80%;
    border: 1px solid #f5f5f5;
    background: #fbfbfb;

    &__title {
      font-weight: bold;
      margin-bottom: 5%;
    }

    ::v-deep .el-descriptions-item__label {
      min-width: 0 !important;
    }

    ::v-deep .el-descriptions-item__container {
      padding-left: 10%;
      justify-content: start;
    }
  }
}

.desc {
  min-width: none;
}

.active {
  border: 3px solid #fa8334;
}
</style>
