<template>
  <el-dialog
    v-loading="loading"
    :title="dialogData.dialogTitle || dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="850px"
    center
    @close="closeDialog"
  >
    <el-table
      :data="authIamUsers"
      size="small"
      max-height="450"
      tooltip-effect="dark"
    >
      <el-table-column
        :show-overflow-tooltip="true"
        label="子账号名"
        prop="iamUserName"
        width="180"
        fixed
      />
      <el-table-column
        label="子账号ID"
        prop="iamUserId"
        width="180"
      />
      <template
        v-for="action of filteredSystemActionList"
      >
        <el-table-column
          :key="action.actionKey"
          :label="action.actionName"
          :prop="action.actionKey"
          align="center"
          min-width="120"
        >
          <template slot-scope="{row}">
            <i
              :class="{
                'el-icon-check': row[action.actionKey] && row[action.actionKey].auth,
                'el-icon-close': row[action.actionKey] && !row[action.actionKey].auth,
                'inherited': row[action.actionKey] && row[action.actionKey].isInherited
              }"
            />
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { describeAuthIamUsers } from '@/api/accessManage'
import settings from '@/settings'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DescribePermission'
})
export default class extends Vue {
  @Prop()
  private dialogData: any
  private dialogVisible = true
  private dialogTitle = '查看权限'
  private authIamUsers = []
  private loading = false

  private get filteredSystemActionList() {
    const tagObject = UserModule.tags || ({})
    const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
    const res = settings.systemActionList
      .filter((action: any) => !denyPerms.includes(action.actionKey))
      .filter((action: any) => action.resourceType !== '*')

    return res
  }

  private async mounted() {
    try {
      this.loading = true
      const dialogData = this.dialogData
      const res = await describeAuthIamUsers({
        groupId: dialogData.groupId,
        dirPath: dialogData.dirPath,
        deviceId: dialogData.deviceId
      })
      this.authIamUsers = res.iamUsers.map(iamUser => ({
        iamUserId: iamUser.iamUserId,
        iamUserName: iamUser.iamUserName,
        ...iamUser.actions
      }))
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
</style>
