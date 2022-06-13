<template>
  <div class="app-wrap">
    <router-view />
  </div>
</template>

<script lang="ts">
import { isIE } from '@/utils/browser'
import { Component, Vue } from 'vue-property-decorator'

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
  }
}
</script>

<style>
.more {
  min-width: 0 !important;
  text-align: center;
}
</style>
