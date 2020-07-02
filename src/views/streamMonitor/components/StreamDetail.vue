<template>
  <div>
    <label
      class="back"
      @click="back"
    >
      <i class="el-icon-back" /> streamName
    </label>

    <div class="stream-detail">
      <div class="stream-detail__label">
        时长
      </div>
      <div class="stream-detail__label">
        推流点
      </div>
      <div class="stream-detail__label">
        源站节点
      </div>
      <div class="stream-detail__label">
        边缘节点
      </div>
      <div class="stream-detail__content">
        {{ streamDetail.pushNode }}
      </div>
      <div class="stream-detail__content">
        {{ streamDetail.originNode }}
      </div>
      <div class="stream-detail__content">
        {{ streamDetail.originNode }}
      </div>
      <div class="stream-detail__content">
        {{ streamDetail.edge }}
      </div>
    </div>

    <div class="stream-charts">
      <div class="stream-charts__item">
        <label>音视频帧率</label>
        <div class="iframe-wrap">
          <iframe
            src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
            frameborder="0"
          />
        </div>
      </div>
      <div class="stream-charts__item">
        <label>码率</label>
        <div class="iframe-wrap">
          <iframe
            src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
            frameborder="0"
          />
        </div>
      </div>
      <div class="stream-charts__item">
        <label>观看数</label>
        <div class="iframe-wrap">
          <iframe
            src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
            frameborder="0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'StreamDetail'
})
export default class extends Vue {
  private timer: any = '';
  private collapseList = ['1', '2', '3'];

  private streamDetail = {
    time: 1,
    pushNode: 2,
    originNode: 3,
    edge: 4
  };

  private getStreamInfo() {
    console.log('触发定时器啦')
  }

  created() {
    this.timer = setInterval(() => this.getStreamInfo(), 10000)
  }

  beforeDestroy() {
    clearInterval(this.timer)
  }

  private back() {
    this.$emit('back')
  }
}
</script>

<style lang="scss" scoped>
$--l1-gray: #e1e1e1;
$--l2-gray: #f1f1f1;

.back {
  &:hover {
    cursor: pointer;
  }
}

.stream-detail {
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid $lightGray;
  margin-top: 10px;

  &__label {
    flex: 0 0 25%;
    text-align: center;
    line-height: 40px;
    background: $--l1-gray;
    border: 1px solid white;
  }

  &__content {
    flex: 0 0 25%;
    line-height: 50px;
    text-align: center;
    background: $--l2-gray;
    border: 1px solid white;
  }
}

.stream-charts {
  display: flex;
  flex-flow: row wrap;
  margin: 8px 0;
  clear: both;

  &__item {
    flex: 0 0 48%;
    margin: 10px;
  }

  .iframe-wrap {
    margin-top: 10px;
    position: relative;
    overflow: hidden;
  }

  iframe {
    position: relative;
    width: 100%;
  }
}
</style>
