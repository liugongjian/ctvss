<template>
  <div class="dashborad-amap">
    <div id="amap-container" />
    <div class="dashboard-amap-mask--left" />
    <div class="dashboard-amap-mask--right" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
declare let AMap: any

@Component({
  name: 'DashboardMap'
})
export default class extends Vue {
  private amap: any
  private dirList: Array<any> = []
  private timer: any = null
  private index = 0

  private destroyed() {
    clearInterval(this.timer)
  }

  private async created() {
    // @ts-ignore
    window.scriptLoad = () => {
      this.amap = new AMap.Map('amap-container', {
        center: [107.640934, 35.652357],
        zoom: 12,
        zooms: [1, 30],
        showLabel: true,
        viewMode: '3D',
        pitch: 60,
        skyColor: '#080f32'
      })

      // const onMarkOpen = (e: any) => {
      //   const data = e.target.getExtData()
      //   const sum = Math.max(data.sum, data.online)
      //   const online = Math.min(data.sum, data.online)
      //   const offline = sum - online
      //   const content = `
      //   <div style="width: 200px; margin: 10px;color:white;line-height: 24px; font-size:12px;">
      //     <div style="font-size:18px; color:#98cfff; padding-bottom: 8px;margin-bottom: 8px;border-bottom:2px solid #98cfff;">${data.dirName}</div>
      //     <div>设备总数:&nbsp;${sum}</div>
      //     <div>在线:&nbsp;${online}</div>
      //     <div>离线:&nbsp;${offline}</div>
      //   </div>
      //   `
      //   infoWindow.setContent(content)
      //   infoWindow.open(this.amap, e.target.getPosition())
      // }
      // const onMarkClose = () => {
      //   infoWindow.close()
      // }
      const icon = new AMap.Icon({
        size: new AMap.Size(30, 30),
        image: require('../images/ipc-green.svg'),
        imageOffset: new AMap.Pixel(0, 0),
        imageSize: new AMap.Size(30, 30)
      })
      const markList: any = []
      for (let i = 0; i < this.dirList.length; i++) {
        const mark = new AMap.Marker({
          icon: icon,
          position: new AMap.LngLat(
            this.dirList[i].lng,
            this.dirList[i].lat
          ),
          offset: new AMap.Pixel(-10, -10),
          extData: this.dirList[i],
          zoom: 12
        })
        const data: any = this.dirList[i]
        const text = new AMap.Text({
          text: `${data.label}`,
          position: new AMap.LngLat(
            this.dirList[i].lng,
            this.dirList[i].lat
          ),
          offset: new AMap.Pixel(0, -22),
          zoom: 12
        })
        text.setStyle({
          backgroundImage: 'linear-gradient(90deg, #00B3E9, #002DC1)',
          border: 'none',
          color: '#fff',
          fontSize: '12px',
          padding: '4px 7px'
        })
        mark.on('click', () => {
          window.open(data.url)
        })
        // mark.on('mouseout', onMarkClose)
        markList.push(mark)
        markList.push(text)
      }
      this.amap.add(markList)
    }

    await this.getDirInfo()
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://webapi.amap.com/maps?v=1.4.15&key=f94d6b44b13dddb7d32c48302cd6f794&callback=scriptLoad'
    document.head.appendChild(script)
  }

  private async getDirInfo() {
    try {
      this.dirList = [
        {
          lng: '107.640934',
          lat: '35.712557',
          status: 'on',
          label: '铁塔1',
          url: 'http://console.vcn.ctyun.cn/vss/device/preview?inProtocol=gb28181&type=preview&path=219714128769400832,219846516841332737,29942024127917430&deviceId=29942024127917430&previewTab=preview'
        },
        {
          lng: '107.662291',
          lat: '35.662326',
          status: 'on',
          label: '铁塔2',
          url: 'http://console.vcn.ctyun.cn/vss/device/preview?inProtocol=gb28181&type=preview&path=219714128769400832,219846516841332737,29942026275401080&deviceId=29942026275401080&previewTab=preview'
        }
      ]
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
      background-image:
        linear-gradient(
          to right,
          rgb(7, 15, 46, 100%) 80%,
          rgb(7, 15, 46, 0%)
        );
    }

    &--right {
      pointer-events: none;
      position: absolute;
      width: 40%;
      right: 0;
      top: 0;
      bottom: 0;
      background-image:
        linear-gradient(
          to left,
          rgb(7, 15, 46, 100%) 80%,
          rgb(7, 15, 46, 0%)
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
