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
        key: 'faceSampleId',
        label: 'name'
      }"
      :titles="['未绑定', '已绑定']"
      :data="nameList"
      @change="handleChange"
    />
    <div slot="footer" align="center">
      <el-button
        id="button"
        type="primary"
        :disabled="isAble"
        :loading="loading"
        @click="doBindGroupPerson"
      >
        {{ '确定' }}
      </el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  getGroupPersonLeft,
  getGroupPersonAlready,
  bindGroupPerson
} from '@/api/aiConfig'
@Component({
  name: 'CorrelationWith'
})
export default class extends Vue {
  @Prop() private groupId?: string
  private dialogVisible = true
  private loading = false
  private nameModel = []
  private nameList: any = []
  private alreadyList: any = []
  private isAble = true
  mounted() {
    this.getList()
  }
  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async getList() {
    try {
      this.loading = true
      const _leftData = await getGroupPersonLeft({ id: this.groupId })
      const _alreadyData = await getGroupPersonAlready({ id: this.groupId })
      const leftData = this.formateList(_leftData)
      const alreadyData = this.formateList(_alreadyData)
      this.alreadyList = alreadyData
      this.loading = false
      this.nameList = leftData.concat(alreadyData)
      this.nameModel = alreadyData.map(
        (already: { faceSampleId: any }) => already.faceSampleId
      )
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
        faceId: this.nameModel
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
    if (!item.name) return false
    return item.name.indexOf(query) > -1
  }

  private handleChange(value: any, direction: any, movedKeys: any) {
    this.isAble = false
    console.log(value, direction, movedKeys)
    console.log('nameModel: ', this.nameModel)
  }

  private formateList(data: any) {
    if (!data.faces) return []
    return data.faces.map((person: any) => {
      if (person.labels && person.labels.startsWith('{')) {
        return {
          ...person,
          ...JSON.parse(person.labels)
        }
      } else {
        return person
      }
    })
  }
}
</script>
