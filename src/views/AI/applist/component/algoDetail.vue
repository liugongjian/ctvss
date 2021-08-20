<template>
  <div class="app-container">
    <el-card>
      <el-form ref="form" :model="form" :rules="rules" label-width="160px">
        <el-form-item label="算法类型" prop="name">
          <el-input v-model="form.name" :disabled="true" />
        </el-form-item>
        <el-form-item label="应用名称" prop="region">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分析类型">
          <el-select v-model="form.region" placeholder="请选择分析类型">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时段">
          <el-radio-group v-model="form.resource">
            <el-radio label="全天" />
            <el-radio label="时间段" />
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-table
            ref="policyList"
            max-height="500"
            @selection-change="handleSelectionChange"
            @row-click="rowClick"
          >
            <el-table-column
              prop="policyName"
              label="生效时间段"
            >
              <template slot-scope="scope" />
            </el-table-column>
            <el-table-column
              prop="policyDescribe"
              label="操作"
            />
          </el-table>
        </el-form-item>
        <el-form-item label="人脸库">
          <el-select v-model="form.region" placeholder="请选择人脸库">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="回调地址">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="验证类型">
          <el-radio-group v-model="form.resource">
            <el-radio label="无验证" />
            <el-radio label="签名验证" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回调key">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.name" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item>
          <el-button>上一步</el-button>
          <el-button type="primary" @click="onSubmit">立即创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  props: ['prod'],
  data() {
    return {
      breadCrumbContent: '',
      form: {
        name: '算法1'
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ]
      }
    }
  }
}
</script>
<style scoped>
.el-input,.el-textarea,.el-table {
    width: 500px
}
.el-table {
    width: 700px;
}
</style>
