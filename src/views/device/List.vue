<!-- 设备列表 -->
<template>
  <component :is="inProtocol" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gb28181 from './device-gb28181/list.vue'
import rtmp from './device-rtmp/list.vue'
import rtsp from './device-rtsp/list.vue'
import onvif from './device-onvif/list.vue'
import ehome from './device-ehome/list.vue'
import vgroup from './device-vgroup/list.vue'

@Component({
  name: 'DeviceList',
  components: {
    gb28181,
    rtmp,
    rtsp,
    onvif,
    ehome,
    vgroup
  }
})
export default class extends Vue {
  private get inProtocol() {
    return this.$route.query.inProtocol
  }
}
</script>
