<template>
  <el-dialog
    title="关联人员"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="650px"
    @close="closeDialog"
  >
    <el-transfer
      v-model="nameModel"
      v-loading="loading"
      filterable
      :filter-method="filterMethod"
      :props="{
        key: 'id',
        label: 'name'
      }"
      :titles="['未绑定', '已绑定']"
      :data="nameList"
      @change="handleChange"
    />
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="doBindGroupPerson">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getGroupPersonLeft, getGroupPersonAlready, bindGroupPerson } from '@/api/aiConfig'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private groupId?: string
  private dialogVisible = true
  private loading = false
  private nameModel = []
  private nameList: any = []
  private alreadyList: any = []

  mounted() {
    this.getList()
  }
  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async getList() {
    try {
      this.loading = true
      const leftData = await getGroupPersonLeft({ id: this.groupId })
      const alreadyData = this.alreadyList = await getGroupPersonAlready({ id: this.groupId })
      this.loading = false
      this.nameList = leftData.faces.concat(alreadyData.faces.map((already: any) => ({ ...already, disabled: true })))
      this.nameModel = alreadyData.faces.map((already: { id: any }) => already.id)
    } catch (e) {
      this.loading = false
      this.$message.error(e && e.message)
    }
  }

  private async doBindGroupPerson() {
    try {
      this.loading = true
      await bindGroupPerson({
        groupId: this.groupId,
        faceId: this.nameModel.filter(name => this.alreadyList.faces.findIndex((already: any) => already.id === name) === -1)
      })
      this.loading = false
      this.$message.success('绑定成功')
      this.$emit('on-close', true)
    } catch (e) {
      this.loading = false
      this.$message.error(e && e.message)
    }
  }

  private filterMethod(query: string, item: any) {
    return item.name.indexOf(query) > -1
  }

  private handleChange(value: any, direction: any, movedKeys: any) {
    console.log(value, direction, movedKeys)
    console.log('nameModel: ', this.nameModel)
  }
}
</script>
<style lang="scss" scoped>
</style>
