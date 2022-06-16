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
import { createCascadeDir, modifyCascadeDir, describeShareDirs, deleteCascadeDir } from '@/api/upPlatform'
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

  private form: any = {
    id: '',
    dirName: '',
    description: '',
    industryCode: '',
    gbRegionLevel: '',
    gbRegion: ''
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
    switch (this.type) {
      case 'append':
        this.parentDirId = this.selectedNode?.data.id || '-1'
        break
      case 'edit': {
        try {
          const res = await describeShareDirs({
            platformId: this.platformId,
            dirId: this.selectedNode.data.id,
            pageSize: 1000
          })
          if (res.dirs.length > 0) {
            this.form = res.dirs[0]
          }
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
    const param = { platformId: this.platformId, dirs: [{ ...this.form, parentDirId: this.parentDirId, dirType: this.parentDirId ? '1' : '0' }] }
    try {
      switch (this.type) {
        case 'append':
          await createCascadeDir(param)
          break
        case 'edit':
          await modifyCascadeDir(param)
          break
        case 'deleteGroup':
          await deleteCascadeDir(param)
          break
        case 'deleteDevice':
          // await deleteCascadeDevice(this.form.id)
          break
        default:
          break
      }
      this.closeDialog()
      this.$emit('inner-op', { type: this.type, form: this.form, parentDirId: this.parentDirId })
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
