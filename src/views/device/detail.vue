<template>
  <component :is="inProtocol" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gb28181 from './device-gb28181/detail.vue'
import rtmp from './device-rtmp/detail.vue'
import rtsp from './device-rtsp/detail.vue'
import onvif from './device-onvif/detail.vue'
import ehome from './device-ehome/detail.vue'
import vgroup from './device-vgroup/detail.vue'

@Component({
  name: 'DetailList',
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
