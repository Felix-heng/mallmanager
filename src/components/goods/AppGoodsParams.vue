<template>
<el-card class="box-card">
    <!-- 面包屑 -->
    <com-Breadcrumb level1="商品管理" level2="分类参数"></com-Breadcrumb>

    <!-- alert提示框 -->
    <el-alert title="只允许为第三级分类设置参数" type="error" center :closable="false" class="mt"></el-alert>

    <!-- 级联下拉框 -->
    <el-row>
        <span>商品名称</span>
        <el-cascader :options="categorys" clearable v-model="selectOptions" :show-all-levels="false" :props="defaultProps" class="mt" @change="handleCateChange"></el-cascader>
    </el-row>

    <el-tabs type="border-card" value="1" class="mt">
        <el-tab-pane label="动态参数" name="1">
            <el-button type="danger" @click="dialogFormVisibleDy = true">设置动态参数</el-button>
            <!-- 动态参数表格 -->
            <template>
                <el-table :data="goodsDyParams" v-loading="loading">
                    <el-table-column type="expand">
                        <!-- 展开行 -->
                        <template slot-scope="scope">
                            <el-tag :key="tag" v-for="tag in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(scope.row,tag)">
                                {{tag}}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#">
                    </el-table-column>
                    <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShow(scope.row.attr_id,'many')"></el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.attr_id)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="2">
            <el-button type="danger" @click="dialogFormVisibleStatic = true">设置静态参数</el-button>
            <!-- 静态参数表格 -->
            <template>
                <el-table :data="goodsStaticParams" v-loading="loading">
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShow(scope.row.attr_id,'only')"></el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.attr_id)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </el-tab-pane>
    </el-tabs>

    <!-- 动态参数对话框 -->
    <el-dialog :title="(formdata.attr_id !=null ? '修改':'添加') + '动态参数'" :visible.sync="dialogFormVisibleDy" @closed="handelClose('many')">
        <el-form :model="formdata">
            <el-form-item label="参数名称" label-width="120px">
                <el-input v-model="formdata.attr_name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="参数属性" label-width="120px">
                <el-row>
                    <el-col :span="18">
                        <el-input v-model="formdata.attr_vals" autocomplete="off"></el-input>
                    </el-col>
                    <el-col :span="6">以','分割</el-col>
                </el-row>

            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisibleDy = false">取 消</el-button>
            <el-button type="primary" @click="handelGoodEdit('many')">确 定</el-button>
        </div>
    </el-dialog>

    <!-- 静态参数对话框 -->
    <el-dialog :title="(formdata.attr_id !=null ? '修改':'添加') + '静态参数'" :visible.sync="dialogFormVisibleStatic" @closed="handelClose('only')">
        <el-form :model="formdata">
            <el-form-item label="参数名称" label-width="120px">
                <el-input v-model="formdata.attr_name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="参数属性" label-width="120px">
                <el-input v-model="formdata.attr_vals" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisibleStatic = false">取 消</el-button>
            <el-button type="primary" @click="handelGoodEdit('only')">确 定</el-button>
        </div>
    </el-dialog>

</el-card>
</template>

<script>
export default {
    data() {
        return {
            formdata: {}, //表单动态参数
            dialogFormVisibleStatic: false, //静态参数对话框
            dialogFormVisibleDy: false, //动态参数对话框
            inputVisible: false,
            inputValue: '',
            tableData: [], //表单信息
            loading: false, //加载动画
            goodsDyParams: [], //动态参数
            goodsStaticParams: [], //静态参数
            categorys: [], //商品分类下拉框参数
            selectOptions: [], //商品分类数据
            defaultProps: { //级联商品数据
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            }
        }
    },
    created() {
        this.loadData()

    },
    methods: {
        //修改动态参数显示参数信息
        handleShow(id, type) {
            this.$http.get(`categories/${this.selectOptions[2]}/attributes/${id}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.formdata = data
                        if (type === 'only') {
                            this.dialogFormVisibleStatic = true
                        } else {
                            this.dialogFormVisibleDy = true
                        }
                    }
                }).catch(res => {})
        },
        // 删除动态参数
        handelDelete(id) {
            this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`categories/${this.selectOptions[2]}/attributes/${id}`).then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 200) {
                            this.handleCateChange()
                            this.$message.success("删除成功！");
                        }
                    });
                })
                .catch(() => {});
        },
        // 编辑商品参数
        handelGoodEdit(type) {
            let req
            if (this.formdata.attr_id != null) {
                req = this.$http.put(`categories/${this.selectOptions[2]}/attributes/${this.formdata.attr_id}`, this.formdata)
            } else {
                this.formdata.attr_sel = type //设置动态参数类型
                req = this.$http.post(`categories/${this.selectOptions[2]}/attributes`, this.formdata)
            }

            req.then(res => {
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data
                if (status === 201 || status === 200) {
                    this.handleCateChange()
                    if (type === 'many') {
                        this.dialogFormVisibleDy = false
                    } else {
                        this.dialogFormVisibleStatic = false
                    }

                    this.$message.success(msg)
                } else {
                    this.$message.error(msg)
                }
            }).catch(res => {})
        },
        // 关闭对话框并清除数据
        handelClose(type) {
            if (type === 'many') {
                this.dialogFormVisibleDy = false
            } else {
                this.dialogFormVisibleStatic = false
            }
            this.formdata = {}
        },
        // 关闭标签
        handleClose(dyParams, tag) {
            // 删除该标签
            dyParams.attr_vals.forEach((item, index) => {
                if (item === tag) {
                    // 移除当前标签
                    dyParams.attr_vals.splice(index, 1)
                }
            })
            //组装后提交数据
            let formdata = {
                ...dyParams
            }
            formdata.attr_vals = dyParams.attr_vals.length === 0 ? '' : dyParams.attr_vals.join(',')
            // 发送请求                         选中参数id          属性id          
            this.$http.put(`categories/${this.selectOptions[2]}/attributes/${dyParams.attr_id}`, formdata)
                // dyParams.attr_vals.join(',') 将数组转换成字符串传到数据库 进行修改
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.$message.success(msg)
                    } else {
                        this.$message.error(msg)
                    }
                }).catch(res => {})
        },
        //  标签显示输入
        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        //  添加并确认输入的内容
        handleInputConfirm(dyParams) {
            let inputValue = this.inputValue;
            if (inputValue) {
                dyParams.attr_vals.push(inputValue)
                //组装后提交数据
                let formdata = {
                    ...dyParams
                }
                // dyParams.attr_vals.join(',') 将数组转换成字符串传到数据库 进行修改
                formdata.attr_vals = dyParams.attr_vals.length === 0 ? '' : dyParams.attr_vals.join(',')
                // 发送请求                         选中参数id          属性id          
                this.$http.put(`categories/${this.selectOptions[2]}/attributes/${dyParams.attr_id}`, formdata)
                    .then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data
                        if (status === 200) {
                            this.$message.success(msg)
                        }
                    }).catch(res => {})
            }
            this.inputVisible = false
            this.inputValue = ''
        },
        // 加载级联下拉框的商品分类
        loadData() {
            this.$http.get(`categories`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.categorys = data
                    }
                })
        },
        // 选中分类参数同时时加载动态参数和静态参数
        handleCateChange() {
            // 获取分类ID (获取选中商品id数组 并只需要最后一个id即可)
            let id = this.selectOptions[2]
            if (id === null) {
                return
            }
            this.$http.get(`categories/${id}/attributes?sel=many`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.goodsDyParams = data
                        // 处理动态参数                        
                        this.goodsDyParams.map(item => {
                            item.attr_vals = item.attr_vals !== '' ? item.attr_vals.split(',') : []
                        })
                    }
                }).catch(res => {})
            this.$http.get(`categories/${id}/attributes?sel=only`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.goodsStaticParams = data
                    }
                }).catch(res => {})

        }
    },

}
</script>

<style scoped>
.mt {
    margin-top: 20px;
}

.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
