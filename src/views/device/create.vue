<template>
  <component :is="inProtocol" />
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gb28181 from './device-gb28181/create.vue'
import rtmp from './device-rtmp/create.vue'
import rtsp from './device-rtsp/create.vue'

@Component({
  name: 'DeviceList',
  components: {
    gb28181,
    rtmp,
    rtsp
  }
})
export default class extends Vue {
  private get inProtocol() {
    return this.$route.query.inProtocol
  }
}
</script>
