<template>
  <div class="app-container">
    <el-page-header content="流列表" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="设备号" prop="deviceId">
          <el-input v-model="form.deviceId" />
        </el-form-item>
        <template v-if="true">
          <el-form-item label="存储区域" prop="storeRegion">
            <el-cascader
              v-model="form.storeRegion"
              placeholder="请选择"
              :options="regionList"
            />
          </el-form-item>
          <el-form-item label="桶名称" prop="bucketName">
            <el-input v-model="form.bucketName" />
          </el-form-item>
          <el-form-item label="设备流的类型" prop="streamType">
            <el-radio v-model="form.streamType" :label="1">全量视频</el-radio>
            <el-radio v-model="form.streamType" :label="2">移动侦测</el-radio>
          </el-form-item>
          <el-form-item label="业务ID" prop="streamCode">
            <el-input v-model="form.streamCode" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="标签" prop="tags">
            <div v-for="(tag, index) in form.tags" :key="index" class="form-tags">
              <el-input v-model="form.tags[index].key" placeholder="键" />
              <el-input v-model="form.tags[index].value" placeholder="值" />
              <el-button type="text" @click="removeTag(index)">
                <svg-icon
                  name="close"
                  width="10"
                  height="10"
                />
              </el-button>
            </div>
            <div v-if="form.tags.length < 10" class="form-tags__add">
              <el-button @click="addTag">添加标签</el-button>
            </div>
          </el-form-item>
        </template>
        <el-form-item label="过期时间" prop="expires">
          <el-date-picker
            v-model="form.expires"
            type="datetime"
            value-format="timestamp"
            placeholder="选择过期时间"
            size="small"
            :picker-options="pickerOptions"
          />
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
<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import { Stream } from '@/type/stream'
import { createStream, createStreamKanjia } from '@/api/stream'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { pick } from 'lodash'
import { getRegions } from '@/api/region'

@Component({
  name: 'StreamCreate'
})
export default class extends Vue {
  private loading = false
  private form: Stream = {
    groupId: '',
    deviceId: '',
    storeRegion: '',
    bucketName: '',
    streamType: 1,
    streamCode: '',
    tags: [{
      key: '',
      value: ''
    }],
    expires: (new Date()).getTime()
  }

  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() < Date.now()
    }
  }

  private rules = {
    deviceId: [
      { required: true, message: '请输入设备号', trigger: 'blur' }
    ],
    storeRegion: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    bucketName: [
      { required: true, message: '请输入桶名称', trigger: 'blur' }
    ],
    streamType: [
      { required: true, message: '请选择设备流的类型', trigger: 'change' }
    ],
    streamCode: [
      { required: true, message: '请输入业务ID', trigger: 'blur' }
    ],
    expires: [
      { required: true, message: '请选择过期时间', trigger: 'change' }
    ]
  }

  private regionList = []

  private get userType() {
    return UserModule.type
  }

  private get currentGroupId() {
    return GroupModule.group?.groupId
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String, oldGroupId: string) {
    if (!groupId) return
    this.$set(this.form, 'groupId', groupId)
    oldGroupId && this.back()
  }

  private mounted() {
    this.getRegionList()
  }

  /**
   * 获取区域列表
   */
  private async getRegionList() {
    this.loading = true
    try {
      this.regionList = await getRegions()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private addTag() {
    this.form.tags?.push({
      key: '',
      value: ''
    })
  }

  private removeTag(index: number) {
    this.form.tags?.splice(index, 1)
  }

  private back() {
    this.$router.push({
      path: '/stream'
    })
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        let params: any = {}
        // HARDCODE: 针对天翼看家单独判断
        if (this.userType === 'kanjia') {
          params = pick(this.form, ['groupId', 'deviceId', 'storeRegion', 'bucketName', 'streamType', 'streamCode', 'expires'])
          params.storeRegion = params.storeRegion[params.storeRegion.length - 1]
        } else {
          params = pick(this.form, ['groupId', 'deviceId', 'expires'])
          let tags: string[] = []
          this.form.tags?.forEach((tag: any) => {
            if (tag.key) {
              tags.push(`${tag.key}:${tag.value}`)
            }
          })
          if (tags.length) {
            params.tags = tags.join(',')
          }
        }
        params['expires'] = Math.ceil(params['expires'] / 1000)
        try {
          this.userType === 'kanjia' ? await createStreamKanjia(params) : await createStream(params)
          this.$message.success('新建流成功！')
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
  .el-input, .el-select, .el-textarea, .el-cascader {
    width: 400px;
  }
  .form-tags .el-input {
    width: 180px;
    margin-bottom: 5px;
    margin-right: 10px;
  }
  .form-tags .el-button--text {
    color: $textGrey;
    svg {
      vertical-align: middle;
    }
    &:hover {
      color: $primary;
    }
  }
</style>
