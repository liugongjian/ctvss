<template>
  <el-dialog
		:loading="loading.dialog"
    :title="isCreate ? '创建巡航路径' : `${currentIndex}配置`"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="400px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="路径名称:" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="巡航速度:" prop="speed">
        <el-slider
					v-model="form.speed"
					:min="1"
					:max="40"
					:show-input="true"
					:show-input-controls="false"
				/>
			</el-form-item>
			<el-form-item label="停留间隔:" prop="resetTime">
        <el-input class="time-input" v-model="form.resetTime" /> 秒
			</el-form-item>
      <el-form-item label="巡航列表:" prop="path">
        <div class="path-list">
					<div class="path-list__header">
						预置位
						<el-button type="text" title="添加" @click="addItem"><i class="el-icon-plus" /></el-button>
					</div>
					<div class="path-list__content">
						<div
							v-for="(item, index) in form.pathList"
							:key="index"
							class="path-list__item"
						>
							<el-form-item label-width="0" :prop="'pathList.' + index" :rules="rules.pathIem">
								<el-input size="mini" v-model="form.pathList[index]" />
								<el-button type="text" title="删除" @click="deleteItem(index)"><i class="el-icon-minus" /></el-button>
							</el-form-item>
						</div>
					</div>
				</div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Dir } from '@/type/dir'
import { createDir, updateDir } from '@/api/dir'

@Component({
  name: 'CreateDir'
})
export default class extends Vue {
  @Prop()
  private isCreate?: boolean
  @Prop()
  private currentIndex?: any
  private dialogVisible = true
  private loading: any = {
		dialog: false,
		submit: false
	}
  private form: any = {
    name: '',
    speed: 20,
		resetTime: '',
		path: '',
		pathList: []
  }
  private rules = {
    resetTime: [
      { required: true, message: '请填写停留间隔', trigger: 'blur' },
      { validator: this.validateTime, trigger: 'blur' }
    ],
    path: [
      { required: true, message: '巡航列表不能为空', trigger: 'blur' }
    ],
		pathIem: [
			{ required: true, message: '预置位不能为空', trigger: 'blur' },
			{ validator: this.validatePathItem, trigger: 'blur' }
		]
  }

  private get isEdit() {
    return !!this.currentDir
  }

  private mounted() {
		console.log(this.isCreate);
    if (!this.isCreate) {
			
			
			try {
				this.loading.dialog = true
				let path: string = '1,3,5,7,9'
				this.form = {
					name: '预置位1',
					speed: 23,
					resetTime: '222',
					path: path,
					pathList: path.split(',')
				}
			} catch (e) {
				this.$message.error(e && e.message)
			} finally {
				this.loading.dialog = false
			}
    }
  }

  private addItem() {
		this.form.pathList.push('')
	}

	private deleteItem(index: number) {
		this.form.pathList.splice(index, 1)
	}

  private async submit() {
		this.form.path = this.form.pathList.join(',')
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.loading.submit = true
          console.log(this.form);
					
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading.submit = false
        }
        this.closeDialog(true)
      }
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

	private validateTime(rule: any, value: any, callback: Function) {
    if (!/^[0-9]*$/.test(value)) {
      callback(new Error('时间格式错误'))
    } else if (value < 5 || value > 720) {
      callback(new Error('仅支持5-720秒'))
    } else {
      callback()
    }
  }

	private validatePathItem(rule: any, value: any, callback: Function) {
    if (!/^[0-9]*$/.test(value)) {
      callback(new Error('格式错误'))
    } else if (value < 1 || value > 255) {
      callback(new Error('仅支持1-255'))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form {
	::v-deep {
		.el-slider.el-slider--with-input {
			.el-slider__input {
				width: 50px;
			}
			input {
				padding-left: 4px;
				padding-right: 4px;
			}
		}
		.el-slider__runway.show-input {
			margin-right: 60px;
		}
	}
	
	.time-input {
		width: 80px;
		margin-right: 10px
	}
	.path-list {
		border: 1px solid #DCDFE6;
		border-radius: 5px;
		text-align: center;
		height: 200px;
		overflow: auto;
		&__header {
			width: 90%;
			display: inline-block;
			border-bottom: 1px solid #DCDFE6;
			margin-bottom: 15px;
			.el-button {
				margin-left: 10px
			}
		}
		&__item {
			height: 50px;
			line-height: 50px;
			.el-input {
				width: 80px;
				margin-right: 10px;
			}
			::v-deep {
				.el-input__inner {
					text-align: center
				}
				.el-form-item__error {
					left: 30%;
					top: calc(100% - 6px)
				}
			}
		}
	}
}
</style>
