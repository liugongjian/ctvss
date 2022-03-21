<template>
  <div class="screen-list">
    {{ currentScreen.deviceName }}
    List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>List<br>
    List<br>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'

@Component({
  name: 'ScreenList'
})
export default class extends Vue {
  @Inject('getScreenManager')
  private getScreenManager: Function

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get currentScreen() {
    return this.screenManager.currentScreen
  }
}
</script>
