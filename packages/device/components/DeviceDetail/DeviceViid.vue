<template>
  <div class="device-container">
    device-viid
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { toLowerCase, toUpperCase } from '@vss/base/utils/param'
import { deviceMock } from '@vss/device/mock/device'

@Component({
  name: 'DeviceViid'
})
export default class extends Vue {
  private mounted() {
    const res = toLowerCase(deviceMock)
    console.log(res)
    const res2 = toUpperCase(res)
    console.log(res2)
  }
}
</script>
