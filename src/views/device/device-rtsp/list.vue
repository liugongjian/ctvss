<template>
  <Rtmp />
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import Rtmp from '../device-rtmp/list.vue'

@Component({
  name: 'DeviceRtspList',
  components: {
    Rtmp
  }
})
export default class extends Vue {}
</script>
