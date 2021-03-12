<template>
  <Rtmp />
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import Rtmp from '../device-rtmp/create.vue'

@Component({
  name: 'CreateRtspDevice',
  components: {
    Rtmp
  }
})
export default class extends Vue {}
</script>
