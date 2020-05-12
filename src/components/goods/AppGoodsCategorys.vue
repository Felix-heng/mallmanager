<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="商品管理" level2="商品分类"></com-Breadcrumb>

        <!-- 按钮 -->
        <el-button type="success" plain class="addbtn" @click="handleShowAdd">添加商品分类</el-button>

        <!-- 数据表格 v-loading="loading" loading属性 是加载动画 当网速慢时会触发加载动画(loading值为true时触发) -->
        <template>
            <el-table :data="categorys" border v-loading="loading" height="450">
                <el-tree-grid label="分类名称" prop="cat_name" treeKey="cat_id" parentKey="cat_pid" levelKey="cat_level" childKey="children" :indentSize=30 folderIcon=""></el-tree-grid>
                <el-table-column label="级别">
                    <template slot-scope="scope">
                        <span v-if="scope.row.cat_level === 0">一级</span>
                        <span v-if="scope.row.cat_level === 1">二级</span>
                        <span v-if="scope.row.cat_level === 2">三级</span>
                    </template>
                </el-table-column>
                <el-table-column label="是否有效">
                    <template slot-scope="scope">
                        {{scope.row.cat_deleted ? "无效":"有效"}}
                    </template>
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="handleShowEdit(scope.row)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.cat_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <!-- 分页显示 -->
        <!--    size-change:页面显示条数，改变时会触发
                current-change:当前页，改变时会触发
                current-page   当前页码
                page-sizes   支持每页显示条数
                page-size   每页显示条数
                total   总条数
                layout  组件布局
      -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" class="pageHelp"></el-pagination>
        <!-- 添加商品分类对话框 -->
        <el-dialog title="添加商品分类" :visible.sync="dialogFormVisibleAdds " @close="handelClose">
            <el-form label-position="right" label-width="80px" :model="formdata">
                <el-form-item label="分类名称">
                    <el-input v-model="formdata.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="分类">
                    <el-cascader :options="options" v-model="selectCategory" :props="defaultParas" checkStrictly="true" clearable></el-cascader>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleAddAdds = false">取 消</el-button>
                <el-button type="primary" @click="handelAdd">添 加</el-button>
            </div>
        </el-dialog>
        <!-- 修改商品分类对话框 -->
        <el-dialog title="编辑商品分类" :visible.sync="dialogFormVisibleModify" @closed="handleCloseEdit">
            <el-form :model="formdata">
                <el-form-item label="商品分类名称" label-width="120px">
                    <el-input v-model="formdata.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleModify = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit">修改</el-button>
            </div>
        </el-dialog>

    </el-card>
</div>
</template>

<script>
var ElTreeGrid = require('element-tree-grid');
export default {
    data() {
        return {
            categorys: [], //用户数据
            pagenum: 1, //当前页
            pagesize: 5, //每页条数
            total: 0, //总条数
            dialogFormVisibleAdds: false, //添加商品对话框控制
            dialogFormVisibleModify: false, //修改商品分类对话框
            formdata: {}, //表单数据
            selectCategory: [], //选中的参数
            loading: true,
            options: [], //参数列表
            defaultParas: { //参数列表的值
                value: "cat_id",
                label: "cat_name",
                children: "children",
                checkStrictly: "true"
            }
        };
    },
    created() {
        // 查询数据
        this.Load();
    },
    methods: {
        // 显示添加对话框
        handleShowAdd() {
            this.dialogFormVisibleAdds = true
            this.$http.get(`categories?type=2`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.options = data
                    }
                })
                .catch(res => {})
        },
        // 增加商品分类
        handelAdd() {
            if (this.selectCategory.length === 1) {
                // 第二级
                this.formdata.cat_level = 1
                this.formdata.cat_pid = this.selectCategory[0]
            } else if (this.selectCategory.length === 2) {
                // 第三级
                this.formdata.cat_level = 2
                this.formdata.cat_pid = this.selectCategory[1]
            } else {
                // 第一级
                this.formdata.cat_level = 0
                this.formdata.cat_pid = 0
            }
            this.$http.post(`categories`, this.formdata).then(res => {
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data;
                if (status === 201) {
                    this.Load();
                    this.$message.success(msg);
                    // 关闭对话框
                    this.dialogFormVisibleAdds = false;
                }
            });

        },

        // 关闭添加窗口
        handelClose() {
            // 清空所有表单数据
            this.formdata = {};
        },
        // 打开修改对话框
        handleShowEdit(goods) {
            this.dialogFormVisibleModify = true
            this.formdata = goods
        },
        handleCloseEdit() {
            this.dialogFormVisibleModify = false
            this.formdata = {}
        },
        // 修改商品分类名称
        handleEdit() {
            this.$http.put(`categories/${this.formdata.cat_id}`, this.formdata).then(res => {
                // 解构data
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data;
                if (status === 200) {
                    this.dialogFormVisibleModify = false
                    //   成功后刷新页面
                    this.Load();
                    this.$message.success(msg);
                }
            }).catch(res => {});
        },
        // 删除商品分类
        handelDelete(id) {
            this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`categories/${id}`).then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 200) {
                            this.Load();
                            this.$message.success("删除成功！");
                        }
                    });
                })
                .catch(() => {});
        },
        // 加载数据
        Load() {
            // query={查询的字段}  pagenum={当前页}  pagesize={每页数据条数}
            this.$http.get(`categories?pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
                .then(res => {
                    // 解构data
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    this.loading = false
                    if (status === 200) {
                        this.categorys = data.result
                        this.pagenum = data.pagenum;
                        this.total = data.total;
                    }
                });
        },

        // 翻页显示数据

        // 页面大小发生变化
        handleSizeChange(val) {
            this.pagesize = val;
            this.Load();
        },
        // 页码发生变化
        handleCurrentChange(val) {
            this.pagenum = val;
            this.Load();
        }
    },
    components: {
        ElTreeGrid
    },
};
</script>

<style scoped>
.addbtn {
    margin: 20px;
}

.pageHelp {
    text-align: center;
    margin: 20px 0;
}
</style>
