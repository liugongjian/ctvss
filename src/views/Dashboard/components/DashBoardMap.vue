<template>
  <div class="dashborad-amap">
    <div id="amap-container" />
    <div class="dashboard-amap-mask--left" />
    <div class="dashboard-amap-mask--right" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import { getDeviceDirInfo } from '@/api/dashboard'
import { DirInfo } from '@/type/DirInfo'
// import { cityMapping } from '@/assets/region/cities'
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
        mapStyle: 'amap://styles/7a72d6ee8e4ef6ad7c80c5dd7e0bad69',
        center: [119.922920, 32.456453],
        zoom: window.outerWidth > 2000 ? 19 : 17,
        zooms: [10, 30],
        showLabel: false,
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
        size: new AMap.Size(25, 25),
        image: require('../images/ipc-green.svg'),
        imageOffset: new AMap.Pixel(0, 0),
        imageSize: new AMap.Size(25, 25)
      })
      const markList: any = []
      for (let i = 0; i < this.dirList.length; i++) {
        const mark = new AMap.Marker({
          icon: icon,
          position: new AMap.LngLat(
            this.dirList[i].posX,
            this.dirList[i].posY
          ),
          offset: new AMap.Pixel(-10, -10),
          extData: this.dirList[i],
          zoom: 17
        })
        const data: any = this.dirList[i]
        const sum = Math.max(data.sum, data.online)
        const online = Math.min(data.sum, data.online)
        const offline = sum - online
        const text = new AMap.Text({
          text: `${this.dirList[i].dirName}: ${online} | ${offline}`,
          position: new AMap.LngLat(
            this.dirList[i].posX,
            this.dirList[i].posY
          ),
          offset: new AMap.Pixel(0, -22),
          zoom: 17
        })
        text.setStyle({
          backgroundImage: 'linear-gradient(90deg, #00B3E9, #002DC1)',
          border: 'none',
          color: '#fff',
          fontSize: '12px',
          padding: '4px 5px'
        })
        // mark.on('mouseover', onMarkOpen)
        // mark.on('mouseout', onMarkClose)
        markList.push(mark)
        markList.push(text)
      }
      this.amap.add(markList)
      // this.setCenter()
    }

    // await this.getDirInfo()
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://webapi.amap.com/maps?v=1.4.15&key=f94d6b44b13dddb7d32c48302cd6f794&callback=scriptLoad&plugin=AMap.Geocoder'
    document.head.appendChild(script)
  }

  // private async getDirInfo() {
  //   try {
  //     const res = await getDeviceDirInfo({})
  //     this.dirList = res.dirs
  //   } catch (e) {
  //     this.$message.error(e && e.message)
  //   }
  // }

  // private async setCenter() {
  //   const cityCode: any = this.$store.state.user.mainUserAddress
  //   const cityName = cityCode > 0 ? cityMapping[cityCode] : ''
  //   let geocoder = new AMap.Geocoder({})
  //   const _this = this
  //   geocoder.getLocation(cityName, function(status, result) {
  //     if (status === 'complete' && result.info === 'OK') {
  //       // console.log(result)
  //       const { lat, lng } = result.geocodes[0].location
  //       _this.amap.setCenter([lng, lat])
  //     } else {
  //       _this.amap.destroy()
  //     // 这里设置左右组件各占满50%宽度
  //     }
  //   })
  // }
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
