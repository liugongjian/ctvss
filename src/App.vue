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
import { getConsoleDropdownTree } from '@/utils/request'

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

    if (this.ctLogin) {
      const dropdownPromise = new Promise((resolve) => {
        getConsoleDropdownTree().then(res => {
          const data = res.data.data
          data.list.splice(data.list.length - 1, 0, {
            domain: 'console.dropdown',
            enable: 'true',
            href: '/vss/changeRole',
            hrefLocal: '/vss/changeRole',
            id: '2021072910001001',
            menuCode: 'changeRole',
            menuId: '2021072910001001',
            name: '切换角色',
            note: '切换角色',
            order: '79',
            parentId: '0',
            plist: '*',
            renderer: 'menu',
            state: 'online',
            target: '_self'
          })
          resolve(data.list)
        })
      })
      CtcloudLayout.consoleLayout.init({
        getDropdownMenuPromise: dropdownPromise
      })
    }
  }
  get ctLogin() {
    return !!UserModule.ctLoginId
  }
}
</script>
