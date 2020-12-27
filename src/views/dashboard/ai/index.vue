<template>
  <div class="dashboard-wrap">
    <div class="ai-recognation">
      <div class="ai-recognation__decorator--top" />
      <div class="ai-recognation__decorator--bottom" />
      <div class="ai-recognation__body">
        <div class="ai-recognation__video">
          <video src="" />
        </div>
        <div class="ai-recognation__images">
          <div v-for="(img, index) in imageList" :key="index" class="ai-recognation__images__item">
            <div class="ai-recognation__images__item__decorator--top" />
            <div class="ai-recognation__images__item__decorator--bottom" />
            <div class="ai-recognation__images__item--wrap">
              <img ref="img" :src="img.src" @load="onload(index)">
              <div class="ai-recognation__images__item--mask" :style="`top:${img.top * img.ratio}px; left:${img.left * img.ratio}px; width:${img.width * img.ratio}px; height:${img.height * img.ratio}px;`" />
            </div>
            <div class="ai-recognation__images__item--datetime">2020-12-27 19:04:33</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'DashboardAI'
})
export default class extends Vue {
  private type = ''
  private imageList = [
    {
      src: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
      locations: [
        {
          top: 40,
          left: 20,
          width: 100,
          height: 100,
          ratio: 0
        },
        {
          top: 60,
          left: 60,
          width: 100,
          height: 100,
          ratio: 0
        }
      ]
    },
    {
      src: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1236258137,222312282&fm=26&gp=0.jpg',
      locations: [
        {
          top: 40,
          left: 20,
          width: 100,
          height: 100,
          ratio: 0
        },
        {
          top: 60,
          left: 60,
          width: 100,
          height: 100,
          ratio: 0
        }
      ]
    }
  ]

  private mounted() {
    let params: any = this.$route.query
    if (params.type) {
      this.type = params.type
    }
  }

  private onload(index: number) {
    console.log(index)
    const imgData: any = this.imageList[index]
    const imgs: any = this.$refs.img
    const img = imgs[index]
    console.log(img)
    imgData.locations.forEach((location: any) => {
      location.ratio = img.clientWidth / img.naturalWidth
    })
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    position: relative;
    background-color: #232F3E;
    height: 100%;
    width: 100%;
    font-size: 16px;
    height: 100vh;
    overflow: auto;
  }
  .ai-recognation {
    border: 2px solid #516F8D;
    margin: 8vh 5vh;
    padding: 2vh;
    position: relative;

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
        border: 7px solid #648fb9;
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
    &__video {
      flex: 1;
      position: relative;
      video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    &__images {
      flex: 2;
      display: flex;
      flex-wrap: wrap;
      &__item {
        position: relative;
        width: 31%;
        margin: 10px;
        border: 1px solid #516F8D;
        border-left: 5px solid #648fb9;
        border-right: 5px solid #648fb9;
        padding: 10px;
        &--wrap {
          position: relative;
        }
        &--mask {
          position: absolute;
          border: 1px solid #eee;
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
        img {
          width: 100%;
          display: block;
        }
      }
    }
  }
</style>
