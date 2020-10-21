<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
        @change="groupChange"
      >
        <el-option
          v-for="item in groupList"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
      <el-tooltip content="仅包含接入类型为RTMP的业务组" placement="right">
        <svg-icon class="filter-container__help" name="help" />
      </el-tooltip>
    </div>
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import { dateFormatInTable } from '@/utils/date'

@Component({
  name: 'Stream'
})
export default class extends Vue {
  private groupId = ''
  private groupList: Array<Group> = []
  private loading = {
    group: false
  }

  private dateFormatInTable = dateFormatInTable

  private mounted() {
    this.getGroupList()
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.getGroupList()
  }

  private async getGroupList() {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    try {
      const res = await getGroups(params)
      this.groupList = res.groups.filter((item: Group) => item.inProtocol === 'rtmp')
      let query: any = this.$route.query
      if (query.groupId) {
        this.groupId = query.groupId
        this.groupChange()
      } else if (this.groupList.length) {
        this.groupId = this.groupList[0].groupId!
        this.groupChange()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.group = false
    }
  }

  private groupChange() {
    console.log(this.groupId)
    this.$router.push({
      path: '/stream/list',
      query: {
        groupId: this.groupId
      }
    })
  }
}
</script>
<style lang="scss" scoped>
</style>
