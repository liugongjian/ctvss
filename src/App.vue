<template>
  <div :id="ctLogin ? 'ctcloud-console' : ''">
    <div id="app">
      <router-view />
      <service-worker-update-popup />
    </div>
  </div>
</template>

<script lang="ts">
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
    !!this.ctLogin && CtcloudLayout.consoleLayout.init()
  }
  get ctLogin() {
    return !!UserModule.ctLoginId
  }
}
</script>
