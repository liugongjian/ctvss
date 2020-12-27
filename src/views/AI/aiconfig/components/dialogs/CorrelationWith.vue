<template>
  <el-dialog
    v-loading="loading"
    title="关联人员"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="650px"
    @close="closeDialog"
  >
    <el-transfer
      v-model="nameModel"
      filterable
      :filter-method="filterMethod"
      :props="{
        key: 'id',
        label: 'name'
      }"
      :titles="['未选', '已选']"
      :data="nameList"
      @change="handleChange"
    />
    <div slot="footer" align="center">
      <el-button type="primary" :loading="loading" @click="doAddGroup">{{ '确定' }}</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getPerson, addGroup } from '@/api/aiConfig'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private groupId?: string
  private dialogVisible = true
  private loading = false
  private nameModel = []
  private nameList: any = []

  mounted() {
    this.getPersonList()
  }
  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async getPersonList() {
    await getPerson({ groupId: this.groupId })
    this.nameList = [
      {
        id: 1,
        name: '阮志健'
      },
      {
        id: 2,
        name: '凌浩'
      },
      {
        id: 3,
        name: '赵光'
      }
    ]
  }

  private async doAddGroup() {
    try {
      this.loading = true
      await addGroup({})
      this.loading = false
    } catch (e) {
      this.loading = false
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
