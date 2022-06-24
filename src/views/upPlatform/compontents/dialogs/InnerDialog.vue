<template>
  <el-dialog
    width="30%"
    :title="title"
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form v-if="type === 'append' || type === 'edit'" ref="form" :label-position="'right'" label-width="130px" :rules="rules" :model="form">
      <el-form-item label="分组名" prop="dirName">
        <el-input v-model="form.dirName" placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item v-if="mode === 'vgroup'" label="所属行业" prop="industryCode">
        <el-select v-model="form.industryCode" placeholder="请选择所属行业">
          <el-option v-for="(item, index) in industryList" :key="index" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级平台区域" prop="gbRegion">
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
import { createCascadeDir, modifyCascadeDir, deleteCascadeDir, describeCascadeDir, cancleShareDevice } from '@/api/upPlatform'
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

  private rules = {
    dirName: [
      { required: true, message: '请输入目录名称', trigger: 'blur' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    gbRegion: [
      { required: true, message: '请选择上级平台区域', trigger: 'blur' }
    ]
  }

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
    let param = {}
    let func

    switch (this.type) {
      case 'append': {
        param = {
          platformId: this.platformId,
          dirs: [{ ...this.form,
            parentDirId: this.currentNode?.data.dirId || '-1',
            dirType: this.mode === 'vgroup' && !this.currentNode ? '0' : '1'
          }]
        }
        func = createCascadeDir
        break
      }
      case 'edit': {
        param = {
          dirId: this.form.dirId,
          dirName: this.form.dirName,
          description: this.form.description,
          industryCode: this.form.industryCode,
          gbRegion: this.form.gbRegion,
          gbRegionLevel: this.form.gbRegionLevel,
          platformId: this.platformId,
          parentDirId: this.currentNode.parent.data.dirId || '-1'
        }
        func = modifyCascadeDir
        break
      }
      case 'deleteGroup': {
        param = {
          dirId: this.currentNode.data.dirId,
          platformId: this.platformId
        }
        func = deleteCascadeDir
        break
      }
      case 'deleteDevice': {
        param = {
          platformId: this.platformId,
          dirId: this.currentNode.parent.data.type !== 'nvr'
            ? this.currentNode.parent.data.dirId
            : this.currentNode.parent.parent.data.dirId,
          devices: [{ deviceId: this.currentNode.data.id }]
        }
        func = cancleShareDevice
        break
      }
      default:
        break
    }
    try {
      if (this.type === 'append' || this.type === 'edit') {
        const form: any = this.$refs.form
        form.validate(async(valid: boolean) => {
          if (valid) {
            await func(param)
            this.successInfo()
          } else {
            return false
          }
        })
      } else {
        await func(param)
        this.successInfo()
      }
    } catch (e) {
      this.$message.error('操作失败: ' + e.message)
      console.log(e)
    }
  }

  private successInfo() {
    this.$emit('inner-op', { type: this.type, form: this.form, selectedNode: this.currentNode })
    this.$message.success('操作成功')
    this.closeDialog()
  }
}
</script>
<style lang="scss" scoped>
.delete-content {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.el-form-item {
  .el-cascader--medium,
  .el-select {
    width: fill-available;
  }
}
</style>
