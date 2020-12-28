<template>
  <div class="dashborad-amap">
    <div id="amap-container" />
    <div class="dashboard-amap-mask--left" />
    <div class="dashboard-amap-mask--right" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceDirInfo } from '@/api/dashboard'
import { DirInfo } from '@/type/dirInfo'
declare let AMap: any

@Component({
  name: 'DashboardMap'
})
export default class extends Vue {
  private amap: any
  private dirList: Array<DirInfo> = []
  private timer: any = null
  private index = 0

  private destroyed() {
    clearInterval(this.timer)
  }

  private async created() {
    // @ts-ignore
    window.scriptLoad = () => {
      this.amap = new AMap.Map('amap-container', {
        mapStyle: 'amap://styles/3836b8d6bbbf8fbff8a92d15cc17cbbc',
        center: [119.922929, 32.455353],
        zoom: 17,
        zooms: [10, 30],
        showLabel: false,
        viewMode: '3D',
        pitch: 60,
        skyColor: '#1E3046'
      })

      const infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -10)
      })
      const onMarkOpen = (e: any) => {
        const data = e.target.getExtData()
        const sum = Math.max(data.sum, data.online)
        const online = Math.min(data.sum, data.online)
        const offline = sum - online
        const content = `
        <div style="width: 200px; margin: 10px;color:white;line-height: 24px; font-size:12px;">
          <div style="font-size:18px; color:#98cfff; padding-bottom: 8px;margin-bottom: 8px;border-bottom:2px solid #98cfff;">${data.dirName}</div>
          <div>设备总数:&nbsp;${sum}</div>
          <div>在线:&nbsp;${online}</div>
          <div>离线:&nbsp;${offline}</div>
        </div>
        `
        infoWindow.setContent(content)
        infoWindow.open(this.amap, e.target.getPosition())
      }
      const onMarkClose = () => {
        infoWindow.close()
      }
      const icon = new AMap.Icon({
        size: new AMap.Size(25, 25),
        image: require('../../icons/svg/ipc-green.svg'),
        imageOffset: new AMap.Pixel(0, 0),
        imageSize: new AMap.Size(25, 25)
      })
      const markList:any = []
      for (let i = 0; i < this.dirList.length; i++) {
        let mark = new AMap.Marker({
          icon: icon,
          position: new AMap.LngLat(
            this.dirList[i].posX,
            this.dirList[i].posY
          ),
          offset: new AMap.Pixel(-10, -10),
          extData: this.dirList[i],
          zoom: 17
        })
        mark.on('mouseover', onMarkOpen)
        mark.on('mouseout', onMarkClose)
        markList.push(mark)
      }
      this.timer = setInterval(() => {
        infoWindow.close()
        const data: any = this.dirList[this.index]
        const sum = Math.max(data.sum, data.online)
        const online = Math.min(data.sum, data.online)
        const offline = sum - online
        const content = `
        <div style="width: 200px; margin: 10px;color:white;line-height: 24px; font-size:12px;">
          <div style="font-size:18px; color:#98cfff; padding-bottom: 8px;margin-bottom: 8px;border-bottom:2px solid #98cfff;">${data.dirName}</div>
          <div>设备总数:&nbsp;${sum}</div>
          <div>在线:&nbsp;${online}</div>
          <div>离线:&nbsp;${offline}</div>
        </div>
        `
        infoWindow.setContent(content)
        infoWindow.open(this.amap, markList[this.index].getPosition())
        this.index++
        if (this.index > 7) {
          this.index = 0
        }
      }, 2000)
      this.amap.add(markList)
    }

    await this.getDirInfo()
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://webapi.amap.com/maps?v=1.4.15&key=71af8b44421cf4f91011a90a6e54c659&callback=scriptLoad'
    document.head.appendChild(script)
  }

  private async getDirInfo() {
    try {
      const res = await getDeviceDirInfo({})
      this.dirList = res.dirs
    } catch (e) {
      this.$message.error(e && e.message)
    }
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
      top: 0;
      left: 0;
      bottom: 0;
      width: 40%;
      background-image: linear-gradient(
        to right,
        rgb(35, 47, 62, 1) 80%,
        rgb(35, 47, 62, 0)
      );
    }
    &--right {
      pointer-events: none;
      position: absolute;
      width: 40%;
      right: 0;
      top: 0;
      bottom: 0;
      background-image: linear-gradient(
        to left,
        rgb(35, 47, 62, 1) 80%,
        rgb(35, 47, 62, 0)
      );
    }
  }
}

#amap-container {
  position: absolute;
  width: 100%;
  height: 100vh;
}

.amap-icon {
  v::deep {
    img {
      filter: opacity(0%);
    }
  }
}
</style>
