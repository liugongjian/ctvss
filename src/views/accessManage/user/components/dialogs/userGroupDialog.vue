<template>
  <el-dialog
    :v-loading="loading.form"
    :title="dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="500px"
    @close="closeDialog"
  >
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="120px"
    >
      <el-form-item v-if="dialogData.type === 'merge'" label="目标子部门:" prop="aimGroupId">
        <el-select v-model="form.aimGroupId" style="width: 80%">
          <el-option
            v-for="(item, index) in dialogData.groupList"
            v-show="item.groupId !== dialogData.data.groupId"
            :key="index"
            :label="item.groupName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-else label="子部门名称:" prop="groupName">
        <el-input v-model="form.groupName" />
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :disabled="loading.submit" @click="operateGroup(dialogData.type)">确定</el-button>
      <el-button :disabled="loading.submit" @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { createGroup, modifyGroup, getGroup, combineGroup } from '@/api/accessManage'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private dialogData: any
  private dialogTitle: string = ''
  private dialogVisible = true
  private loading: any = {
    form: false,
    submit: false
  }
  private form: any = {
    groupName: '',
    groupId: '',
    aimGroupId: ''
  }

  private rules = {
    groupName: [
      { required: true, message: '请输入子部门名称', trigger: 'blur' }
    ],
    aimGroupId: [
      { required: true, message: '请选择目标子部门', trigger: 'blur' }
    ]
  }

  private mounted() {
    if (this.dialogData.type === 'add') {
      this.dialogTitle = '创建子部门'
    } else if (this.dialogData.type === 'edit') {
      this.dialogTitle = '修改子部门'
      this.getGroup()
    } else if (this.dialogData.type === 'merge') {
      this.dialogTitle = '合并子部门'
    }
  }

  private closeDialog(data: any) {
    this.$emit('on-close', data)
  }

  private async getGroup() {
    let params = {
      groupId: this.dialogData.data.groupId
    }
    this.loading.form = true
    let res = await getGroup(params)
    this.loading.form = false
    this.form.groupId = res.groupId
    this.form.groupName = res.groupName
  }

  private async operateGroup(type: any) {
    const form: any = this.$refs.form
    form.validate(async(valid: any) => {
      try {
        if (valid) {
          let params: any = {
            groupName: this.form.groupName
          }
          this.loading.submit = true
          if (type === 'add') {
            await createGroup(params)
            this.$message.success('创建子部门成功')
          } else if (type === 'edit') {
            params.groupId = this.form.groupId
            await modifyGroup(params)
            this.$message.success('修改子部门成功')
          } else if (type === 'merge') {
            params = {
              sourceGroupId: this.dialogData.data.groupId,
              destGroupId: this.form.aimGroupId
            }
            await combineGroup(params)
            this.$message.success('合并子部门成功')
            console.log(this.form.aimGroupId, this.dialogData.data.groupId)
          }
          this.$emit('on-close', 'merge')
        } else {
          return false
        }
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.submit = false
      }
    })
  }
}
</script>
<style lang="scss" scoped>
</style>
