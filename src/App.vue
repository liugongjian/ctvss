<template>
  <div :id="ctLogin ? 'ctcloud-console' : ''">
    <div id="app">
      <router-view />
      <service-worker-update-popup />
    </div>
  </div>
</template>

<script lang="ts">
import { isIE } from '@/utils/browser'
import { Component, Vue } from 'vue-property-decorator'
import ServiceWorkerUpdatePopup from '@/pwa/components/ServiceWorkerUpdatePopup.vue'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'App',
  components: {
    ServiceWorkerUpdatePopup
  }
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
