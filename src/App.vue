<template>
  <div :id="ctLogin ? 'ctcloud-console' : ''" class="app-wrap">
    <div id="app">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { isIE } from '@/utils/browser'
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'App'
})
export default class extends Vue {
  private async mounted() {
    if (isIE()) {
      window.addEventListener('hashchange', () => {
        let currentPath = window.location.hash.slice(1)
        if (this.$route.path !== currentPath) {
          this.$router.push(currentPath)
        }
      }, false)
    }

    !!this.ctLogin && CtcloudLayout.consoleLayout.init()
  }
  get ctLogin() {
    return !!UserModule.ctLoginId
  }
}
</script>

<style>
.more {
  min-width: 0 !important;
  text-align: center;
}
</style>
