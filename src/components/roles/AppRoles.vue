<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="权限管理" level2="角色列表"></com-Breadcrumb>
        <!--  <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb> -->

        <!-- 组合框 -->
        <el-row class="row">
            <el-col :span="6">
                <el-button type="success" plain class="addbtn" @click="dialogFormVisibleEdit = true">添加角色</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格  -->
        <template>
            <el-table :data="formData" v-loading="loading">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- 第一级 -->
                        <el-row v-for="(item1, index) in scope.row.children" :key="index">
                            <el-col :span="4">
                                <el-tag closable class="tags" @close="handleTagClose(scope.row,item1.id)">
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-arrow-right"></i>
                            </el-col>
                            <el-col :span="20">
                                <el-row v-for="(item2, index) in item1.children" :key="index">
                                    <el-col :span="4">
                                        <!-- 第二级 -->
                                        <el-tag closable type="success" class="tags" @close="handleTagClose(scope.row,item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-arrow-right"></i>
                                    </el-col>
                                    <el-col :span="20">
                                        <!-- 第三级 -->
                                        <el-tag closable type="warning" v-for="(item3, index) in item2.children" :key="index" class="tags" @close="handleTagClose(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="showData(scope.row)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.id)"></el-button>
                        <el-button size="mini" type="success" icon="el-icon-check" circle plain @click="showRight(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <!-- 添加用户对话框 roles.id 返回一个数值 当前面加了! 时 则返回值就为true或false -->
        <!-- 添加和修改用一个对话框 运用二元运算符当添加时!roles.id=true 修改时!roles.id=false 来动态改变对话框标题-->
        <el-dialog :title="(!roles.id ? '添加' : '修改')+'角色'" :visible.sync="dialogFormVisibleEdit" @closed="handelClose">
            <el-form :model="roles" :rules="rules" ref="ruleForm">
                <el-form-item label="角色名" label-width="120px" prop="roleName">
                    <el-input v-model="roles.roleName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" label-width="120px" prop="roleDesc">
                    <el-input v-model="roles.roleDesc" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
                <el-button type="primary" @click="handelEdit()">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="dialogFormVisibleRights" @close="handelCloseRights">
            <!-- 树状菜单  show-checkbox：有多选框  :default-expanded-keys 展开的节点  default-checked-keys 选中的节点
                default-expand-all = true : 默认全部展开
             -->
            <el-tree :data="treeRights" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defaultCheckeds" :props="defaultProps" ref="tree">
            </el-tree>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleRights = false">取 消</el-button>
                <el-button type="primary" @click="handleAddRights">确定</el-button>
            </div>
        </el-dialog>
    </el-card>
</div>
</template>

<script>
export default {
    data() {
        return {
            dialogFormVisibleRights: false,
            dialogFormVisibleEdit: false,
            roles: {},
            formData: [], //角色列表数据
            loading: true, //加载动画
            treeRights: [], //权限列表
            defaultCheckeds: [], //默认角色已有的权限
            roleid: 0, //角色id
            defaultProps: {
                id: 'id',
                label: 'authName',
                children: 'children',
            },
            // 表单验证规则
            rules: {
                roleName: [{
                        required: true,
                        message: "请输入角色名称",
                        trigger: "blur"
                    },
                    {
                        min: 2,
                        max: 10,
                        message: "长度在 2 到 5 个字符",
                        trigger: "blur"
                    }
                ],
                roleDesc: [{
                    required: true,
                    message: "请输入角色名称",
                    trigger: "blur"
                }]
            }
        };
    },
    created() {
        this.loadData();
    },
    methods: {
        // 显示编辑对话框
        showData(role) {
            this.dialogFormVisibleEdit = true
            // 结构对象 把对象里的参数都赋值给roles
            this.roles = {
                ...role
            }
        },
        // 关闭对话框
        handelClose() {
            this.roles = {}
            this.dialogFormVisibleEdit = false
            // 重置表单
            this.$refs['ruleForm'].resetFields()
        },

        // 编辑角色
        handelEdit() {
            this.$refs["ruleForm"].validate(valid => {
                if (valid) {
                    // 发送请求
                    let req;
                    if (!this.roles.id) {
                        // 添加请求
                        req = this.$http.post(`roles`, this.roles)
                    } else {

                        req = this.$http.put(`roles/${this.roles.id}`, this.roles)
                    }

                    req.then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 201 || status === 200) {
                            this.loadData()
                            this.$message.success("编辑成功");
                            // 关闭对话框
                            this.dialogFormVisibleEdit = false;
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        // 删除角色
        handelDelete(id) {
            this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`roles/${id}`).then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 200) {
                            this.loadData()
                            this.$message.success("删除成功！");
                        }
                    });
                })
                .catch(() => {});
        },
        // 添加角色权限
        handleAddRights() {
            // 获取选中的权限  等于 半选+全选
            // 半选( this.$refs.tree.getHalfCheckedKeys() )  全选( this.$refs.tree.getCheckedKeys() )
            var arr1 = this.$refs.tree.getCheckedKeys()
            var arr2 = this.$refs.tree.getHalfCheckedKeys()
            //  arr1 、 arr2 合并数组
            var arr = [...arr1, ...arr2]
            this.$http
                .post(`roles/${this.roleid}/rights`, {
                    rids: arr.join(",")
                })
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (status === 200) {
                        // 关闭窗口
                        this.dialogFormVisibleRights = false
                        // 刷新数据
                        this.loadData()
                        this.$message.success(msg)
                    } else {
                        this.$message.error(msg)
                    }
                })
                .catch(res => {});
        },
        // 显示分配权限对话框
        showRight(role) {
            // 获取id 在添加权限时使用
            this.roleid = role.id
            // 打开对话框
            this.dialogFormVisibleRights = true
            // 发送请求获取全部的权限信息
            this.$http
                .get(`rights/tree`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (status === 200) {
                        this.treeRights = data
                    }
                })
                .catch(res => {});
            // 读取已有的权限
            // 只需要读取第三级
            role.children.forEach(e1 => {
                e1.children.forEach(e2 => {
                    e2.children.forEach(e3 => {
                        this.defaultCheckeds.push(e3.id)
                    })
                })
            });

            this.loading = false;
        },
        // 关闭分配权限对话框
        handelCloseRights() {
            this.defaultCheckeds = []
        },
        // 删除指定权限 (方法传两个参数 role ->要删除权限的角色对象  rightsid ->要删除的权限id )
        // 为什么传当前指定行的对象role呢？ 因为删除指定权限后要刷新数据 这时会考虑是使用全局刷新还是局部刷新
        // 考虑到全局刷新过于笨重又要重新加载整个页面 所以使用局部刷新 
        // 而表格也是使用了双向绑定 所以传参数 role对象 在删除权限后讲删除后的data直接 赋给role 就能做到删除以后表格区域刷新数据
        handleTagClose(role, rightsid) {
            this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`roles/${role.id}/rights/${rightsid}`).then(res => {
                        const {
                            data,
                            meta: {
                                msg,
                                status
                            }
                        } = res.data;
                        if (status === 200) {
                            // 局部刷新  (role 当前角色的children)
                            role.children = data
                            this.$message.success(msg);
                        }
                    });
                })
                .catch(() => {});

        },
        // 加载数据
        async loadData() {
            await this.$http
                .get(`roles`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (status === 200) {
                        this.formData = data;
                    }
                })
                .catch(res => {});
            this.loading = false;
        }
    }
};
</script>

<style scoped>
.tags {
    margin: 2px 0px;
}

.row {
    margin: 20px 0;
}

.addbtn {
    margin-left: 10px;
}
</style>
