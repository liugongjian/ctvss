
<template>
  <div>
    <span @click="nodeChange({ id: '' })">根目录</span>
    <span v-for="item in pathList" :key="item.id" @click="nodeChange(item)">
      {{ item.name }}
    </span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getDirPath } from '@vss/device/api/dir'
import { DirectoryTypeEnum } from '@vss/device/enums/index'

@Component({
  name: 'Breadcrumb'
})
export default class extends Vue {
  private directoryTypeEnum = DirectoryTypeEnum
  private pathList = []
  private get deviceId() {
    return this.$route.query.deviceId
  }

  private get dirId() {
    return this.$route.query.dirId
  }

  private get type() {
    return this.$route.query.type || DirectoryTypeEnum.Dir
  }

  private get id() {
    return this.deviceId || this.dirId
  }

  @Watch('id', { immediate: true })
  private async idChange(val) {
    if (val) {
      const res = await getDirPath({
        id: val,
        type: this.type
      })
      this.pathList = res.dirPathList
      this.$router.push({
        query: {
          ...this.$route.query,
          path: this.pathList.map(path => path.id).join(',')
        },
        params: {
          ...this.$route.params,
        }
      })
    } else {
      this.pathList = []
      this.$router.push({
        query: {
          ...this.$route.query,
          path: ''
        },
        params: {
          ...this.$route.params,
        }
      })
    }
  }

  private nodeChange(data) {
    this.$emit('node-change', data)
  }
}
</script>
