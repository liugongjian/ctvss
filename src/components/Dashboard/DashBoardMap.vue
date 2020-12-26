<template>
  <div class="dashborad-amap">
    <div id="amap-container" />
    <div class="dashboard-amap-mask--left" />
    <div class="dashboard-amap-mask--right" />
  </div>
</template>

<script lang="ts">
import { random } from 'lodash'
import { Component, Vue } from 'vue-property-decorator'
declare let AMap: any

@Component({
  name: 'DashboardMap'
})
export default class extends Vue {
  private amap: any

  private created() {
    // @ts-ignore
    window.scriptLoad = () => {
      this.amap = new AMap.Map('amap-container', {
        mapStyle: 'amap://styles/3836b8d6bbbf8fbff8a92d15cc17cbbc',
        center: [119.922929, 32.455353],
        zoom: 17,
        zooms: [10, 30],
        showLabel: false,
        viewMode: '3D',
        pitch: 60
      })

      // AMap.plugin('AMap.ToolBar', () => {
      //   const toolbar = new AMap.ToolBar()
      //   this.amap.addControl(toolbar)
      // })

      // const mark = new AMap.Marker({
      //   icon: icon,
      //   position: new AMap.LngLat(119.922929, 32.455353),
      //   offset: new AMap.Pixel(-10, -10),
      //   title: 'ipc',
      //   zoom: 17
      // })
      const infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, 0)
      })
      const contents = ["<div style='color:blue; margin:0 20px;'>我是header</div>", "<div style='color:red; margin:0 20px;'>我是footer</div>"]
      const onMarkClick = (e: any) => {
        console.log(e)
        infoWindow.setContent(contents.join(e.target.getTitle()))
        infoWindow.open(this.amap, e.target.getPosition())
      }
      const markList = []
      for (let i = -5; i < 5; i++) {
        let icon = new AMap.Icon({
          size: new AMap.Size(20, 20),
          image: require('../../icons/svg/ipc-green.svg'),
          imageOffset: new AMap.Pixel(0, 0),
          imageSize: new AMap.Size(20, 20)
        })
        let mark = new AMap.Marker({
          icon: icon,
          position: new AMap.LngLat(
            119.921029 + 0.005 * Math.random(),
            32.454553 + 0.005 * Math.random()
          ),
          offset: new AMap.Pixel(-10, -10),
          title: "<div style='margin: 0 20px;'>ipc" + i + '</div>',
          zoom: 17
        })
        mark.on('click', onMarkClick)
        markList.push(mark)
      }
      this.amap.add(markList)
    }

    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://webapi.amap.com/maps?v=1.4.15&key=71af8b44421cf4f91011a90a6e54c659&callback=scriptLoad'
    document.head.appendChild(script)
  }

  private mounted() {
    console.log(this.amap)
  }
}
</script>
<style lang="scss" scoped>
.dashboard-amap {
  position: relative;
  &-mask {
    &--left {
      pointer-events: none;
      position: absolute;
      top: 60px;
      left: 0;
      bottom: 0;
      width: 30%;
      background-image: linear-gradient(
        to right,
        rgb(35, 47, 62, 1) 10%,
        rgb(35, 47, 62, 0)
      );
    }
    &--right {
      pointer-events: none;
      position: absolute;
      width: 30%;
      right: 0;
      top: 60px;
      bottom: 0;
      background-image: linear-gradient(
        to left,
        rgb(35, 47, 62, 1) 10%,
        rgb(35, 47, 62, 0)
      );
    }
  }
}

#amap-container {
  position: absolute;
  width: 100%;
  min-height: calc(100vh - 50px);
}

.amap-icon {
  v::deep {
    img {
      filter: opacity(0%);
    }
  }
}
</style>
