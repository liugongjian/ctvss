<template>
  <div>
    <component :is="realGroupInProtocol" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gb28181 from '../device-gb28181/detail.vue'
import rtmp from '../device-rtmp/detail.vue'
import rtsp from '../device-rtsp/detail.vue'
import onvif from '../device-onvif/detail.vue'
import ehome from '../device-ehome/detail.vue'

@Component({
  name: 'DeviceVGroupList',
  components: {
    gb28181,
    rtmp,
    rtsp,
    onvif,
    ehome
  }
})
export default class extends Vue {
  public get realGroupInProtocol() {
    return this.$route.query.realGroupInProtocol
  }
}
</script>
