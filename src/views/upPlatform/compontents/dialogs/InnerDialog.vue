<template>
  <el-dialog
    width="30%"
    :title="title"
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form v-if="type === 'append' || type === 'edit'" :label-position="'right'" label-width="130px">
      <el-form-item label="分组名">
        <el-input v-model="form.dirName" placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item v-if="mode === 'vgroup'" label="所属行业">
        <el-select v-model="form.industryCode" placeholder="请选择所属行业">
          <el-option v-for="(item, index) in industryList" :key="index" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级平台区域">
        <AddressCascader
          :code="form.gbRegion"
          :level="form.gbRegionLevel"
          :disabled="false"
          @change="onDeviceAddressChange"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" placeholder="请输入相关描述" class="form__input" />
      </el-form-item>
    </el-form>
    <div v-else class="delete-content">
      确定{{ title }}?
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { createCascadeDir, modifyCascadeDir, deleteCascadeDir, describeCascadeDir } from '@/api/upPlatform'
import AddressCascader from '@/views/components/AddressCascader.vue'
import { DeviceAddress } from '@/type/device'
import { industryMap } from '@/assets/region/industry'

@Component({
  name: 'InnerDialog',
  components: { AddressCascader }
})
export default class extends Vue {
  @Prop()
  private selectedNode!: any

  @Prop()
  private platformId!: any

  @Prop()
  private type!: String

  @Prop()
  private mode!: String

  private currentNode!: any
  private form: any = {
    id: '',
    dirName: '',
    description: '',
    industryCode: '',
    gbRegion: '',
    gbRegionLevel: ''
  }
  private parentDir: String

  private get industryList() {
    return Object.keys(industryMap).map((key: any) => {
      return {
        name: industryMap[key],
        value: key
      }
    })
  }

  private async mounted() {
    this.currentNode = this.selectedNode
    switch (this.type) {
      case 'append':
        break
      case 'edit': {
        try {
          this.form = await describeCascadeDir({
            platformId: this.platformId,
            dirId: this.currentNode.data.id
          })
        } catch (e) {
          console.log(e)
        }
        break
      }
      case 'deleteGroup':
        // 接口没看到
        this.form = this.selectedNode.data
        break
      case 'deleteDevice':

        break
      default:
        break
    }
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.form.gbRegion = region.code
    this.form.gbRegionLevel = region.level
  }

  private get title() {
    switch (this.type) {
      case 'append':
        return '新建目录'
      case 'edit':
        return '编辑目录'
      case 'deleteGroup':
        return '删除目录'
      case 'deleteDevice':
        return '删除设备'
      default:
        return '提示'
    }
  }

  private closeDialog() {
    this.$emit('close-inner')
  }

  private async submit() {
    try {
      switch (this.type) {
        case 'append': {
          const param = { platformId: this.platformId, dirs: [{ ...this.form, parentDirId: this.currentNode?.data.dirId || '-1' }] }
          await createCascadeDir(param)
          break
        }
        case 'edit': {
          const paramEdit = {
            dirId: this.form.dirId,
            dirName: this.form.dirName,
            description: this.form.description,
            industryCode: this.form.industryCode,
            gbRegion: this.form.gbRegion,
            gbRegionLevel: this.form.gbRegionLevel,
            platformId: this.platformId,
            parentDirId: this.currentNode.parent.data.dirId || '-1'
          }
          await modifyCascadeDir(paramEdit)
          break
        }
        case 'deleteGroup': {
          const paramDel = {
            dirId: this.form.dirId,
            platformId: this.platformId
          }
          await deleteCascadeDir(paramDel)
          break
        }
        case 'deleteDevice': {
          console.log('this.currentNode:', this.currentNode)
          // const paramDelDevice = {
          //   dirId: this.form.dirId,
          //   platformId: this.platformId,
          //   devices: []
          // }
          // await deleteCascadeDevice(this.form.id)

          break
        }
        default:
          break
      }

      this.closeDialog()
      this.$emit('inner-op', { type: this.type, form: this.form, selectedNode: this.selectedNode })
    } catch (e) {
      this.$message.error('创建失败')
      console.log(e)
    }
  }
}
</script>
<style lang="scss" scoped>
.delete-content {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
