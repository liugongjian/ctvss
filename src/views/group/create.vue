<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item v-if="form.groupId" label="业务组Id:" prop="groupId">
          <el-input v-model="form.groupId" disabled />
        </el-form-item>
        <el-form-item label="业务组名称:" prop="groupName" class="form-with-tip">
          <el-input v-model="form.groupName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中文、中划线。空间名称不能重复。</div>
        </el-form-item>
        <el-form-item label="业务组描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入业务组描述，如业务介绍或用途" />
        </el-form-item>
        <el-form-item prop="region" class="form-with-tip">
          <template slot="label">
            服务区域:
            <el-popover
              placement="top-start"
              title="服务区域"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="服务区域负责对流媒体进行实时处理，包括鉴权、拉流、转码、录制、截图等，请根据处理和存储需求选择"
            >
              <i slot="reference" class="form-question el-icon-question" />
            </el-popover>
          </template>
          <el-select v-model="form.region" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="接入类型:" prop="inProtocol">
          <el-radio-group v-model="form.inProtocol">
            <el-radio v-for="protocol in inProtocolList" :key="protocol" :label="protocol.toLocaleLowerCase()">{{ protocol }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="播放类型:" prop="outProtocol">
          <el-checkbox-group v-model="form.outProtocol">
            <el-checkbox
              v-for="protocol in outProtocolList"
              :key="protocol"
              :label="protocol.toLocaleLowerCase()"
            >
              {{ protocol }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- 国标业务组允许设置是否自动拉流 -->
        <el-form-item v-if="form.inProtocol === 'gb28181'" prop="pullType">
          <template slot="label">
            自动拉流:
            <el-popover
              placement="top-start"
              title="自动拉流"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="当启用自动拉流，国标设备注册成功后自动启动拉流。关闭该选项后需要通过触发的方式启动拉流。"
            >
              <i slot="reference" class="form-question el-icon-question" />
            </el-popover>
          </template>
          <el-switch v-model="form.pullType" :active-value="1" :inactive-value="2" />
        </el-form-item>
        <el-form-item label="">
          <div class="mt10">
            <el-button :loading="loading" type="primary" @click="submit">确定</el-button>
            <el-button @click="back">取 消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Group } from '@/type/group'
import { InProtocolType, OutProtocolType } from '@/dics'
import { createGroup, queryGroup, updateGroup } from '@/api/group'
import { parse } from 'date-fns'

@Component({
  name: 'CreateGroup'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private loading = false
  private rules = {
    groupName: [
      { required: true, message: '请输入业务组名称', trigger: 'blur' },
      { validator: this.validateGroupName, trigger: 'blur' }
    ],
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    inProtocol: [
      { required: true, message: '请选择接入类型', trigger: 'change' }
    ],
    outProtocol: [
      { required: true, message: '请选择播放类型', trigger: 'change' },
      { validator: this.validateOutProtocol, trigger: 'change' }
    ],
    pullType: [
      { required: true, message: '请选择是否开启自动拉流', trigger: 'change' }
    ]
  }
  private regionList = ['华东', '华南', '华北']
  private outProtocolList = Object.values(OutProtocolType)
  private inProtocolList = Object.values(InProtocolType)
  private form: Group = {
    groupName: '',
    description: '',
    region: '华东',
    inProtocol: 'gb28181',
    outProtocol: [],
    pullType: 1
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    let query: any = this.$route.query
    if (query.groupId) {
      this.$set(this.form, 'groupId', query.groupId)
      this.loading = true
      try {
        const res = await queryGroup({ groupId: this.form.groupId })
        res.outProtocol = res.outProtocol.split(',')
        this.form = res
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading = false
      }
    }
  }

  private validateGroupName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{4,16}$/u.test(value)) {
      callback(new Error('业务组名称格式错误。4-16位，可包含大小写字母、数字、中文、中划线。'))
    } else {
      callback()
    }
  }

  private validateOutProtocol(rule: any, value: string, callback: Function) {
    if (value.length === 0) {
      callback(new Error('请选择'))
    } else {
      callback()
    }
  }

  private back() {
    if (this.$route.name === 'group-update') {
      this.$router.push({
        path: '/group/config',
        query: { groupId: this.form.groupId!.toString() }
      })
    } else {
      this.$router.push('/group')
    }
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        var res
        this.loading = true
        var params = JSON.parse(JSON.stringify(this.form))
        params.outProtocol = params.outProtocol.join(',')
        try {
          if (this.form.groupId) {
            res = await updateGroup(params)
            this.$message.success('修改业务组成功！')
          } else {
            res = await createGroup(params)
            this.$message.success('新建业务组成功！')
          }
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading = false
        }
      } else {
        return false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea {
    width: 400px;
  }
</style>
