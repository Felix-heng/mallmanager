<template>
<div>
    <el-card class="box-card">
        <!-- 面包屑 -->
        <com-Breadcrumb level1="用户管理" level2="用户列表"></com-Breadcrumb>

        <!-- 组合框 -->
        <el-row class="row">
            <el-col :span="8">
                <el-input placeholder="请输入内容" class="input-with-select" v-model="searchValue">
                    <el-button slot="append" icon="el-icon-search" @click="Load()"></el-button>
                </el-input>
            </el-col>
            <el-col :span="6">
                <el-button type="success" plain class="addbtn" @click="dialogFormVisibleAdd = true">添加用户</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格 v-loading="loading" loading属性 是加载动画 当网速慢时会触发加载动画(loading值为true时触发) -->
        <template>
            <el-table :data="users" border v-loading="loading">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column label="创建日期">
                    <template slot-scope="scope">{{scope.row.create_time |moment('YYYY-MM-DD HH:mm:ss')}}</template>
                </el-table-column>
                <el-table-column label="用户状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="handelState(scope.row.id,scope.row.mg_state)"
                         active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" circle plain @click="dialogFormVisibleEdit = true,showData(scope.row.id)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" circle plain @click="handelDelete(scope.row.id)"></el-button>
                        <el-button size="mini" type="success" icon="el-icon-check" circle plain @click="showRole(scope.row.id)"></el-button>
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
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[2, 4, 6, 8]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" class="pageHelp"></el-pagination>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd" @close="handelClose">
            <el-form :model="formdata" :rules="rules" ref="ruleForm">
                <el-form-item label="用户名" label-width="120px" prop="username">
                    <el-input v-model="formdata.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" label-width="120px" prop="password">
                    <el-input v-model="formdata.password" autocomplete="off" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" label-width="120px" prop="repwd">
                    <el-input v-model="formdata.repwd" autocomplete="off" show-password></el-input>
                </el-form-item>
                <el-form-item label="邮箱" label-width="120px" prop="email">
                    <el-input v-model="formdata.email" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号" label-width="120px" prop="mobile">
                    <el-input v-model="formdata.mobile" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleAddAdd = false">取 消</el-button>
                <el-button type="primary" @click="handelAdd">添 加</el-button>
            </div>
        </el-dialog>
        <!-- 编辑用户对话框 -->
        <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit" @close="handleCloseEdit">
            <el-form :model="formdata" :rules="rules" ref="ruleForm">
                <el-form-item label="用户名" label-width="120px">
                    <el-input v-model="formdata.username" autocomplete="off" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" label-width="120px" prop="email">
                    <el-input v-model="formdata.email" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号" label-width="120px" prop="mobile">
                    <el-input v-model="formdata.mobile" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
                <el-button type="primary" @click="handelEdit(formdata.id)">修改</el-button>
            </div>
        </el-dialog>
        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRole" @close="handelCloseRole">
            <el-form :model="formdata">
                <el-form-item label="用户名:" label-width="120px">
                    {{formdata.username}}
                </el-form-item>
                <el-form-item  label="角色:" label-width="120px">
                    <el-select v-model="formdata.rid" placeholder="请选择">
                    <el-option
                    v-for="item in roles"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                    </el-option>
                </el-select>
                </el-form-item>
                
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
                <el-button type="primary" @click="handleRole">确定</el-button>
            </div>
        </el-dialog>
    </el-card>
</div>
</template>

<script>
export default {
    data() {
        // 确认密码
        var validateRepwd = (rule, value, callback) => {
            console.log(value);
            if (value === "" || value === undefined) {
                callback(new Error("请再次输入密码"));
            } else if (value !== this.formdata.password) {
                callback(new Error("两次输入密码不一致!"));
            } else {
                callback();
            }
        };
        //邮箱验证
        var validateEmail = (rule, value, callback) => {
            let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (value === "" || value === undefined) {
                callback(new Error("请再次输入密码"));
            } else if (!reg.test(value)) {
                callback(new Error("邮箱格式不合法!"));
            } else {
                callback();
            }
        };
        // 手机号验证
        var validateMobile = (rule, value, callback) => {
            let reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (value === "" || value === undefined) {
                callback(new Error("请再次输入密码"));
            } else if (!reg.test(value)) {
                callback(new Error("手机号格式不合法!"));
            } else {
                callback();
            }
        };
        return {
            users: [], //用户数据
            pagenum: 1, //当前页
            pagesize: 2, //每页条数
            total: 0, //总条数
            searchValue: "", //查询的内容
            dialogFormVisibleAdd: false, //添加用户对话框控制
            formdata: {}, //表单数据
            dialogFormVisibleEdit: false, //修改用户对话框
            dialogFormVisibleRole: false, //分配角色对话框
            roles: {}, //角色数据
            //表单验证规则 
            rules: {
                username: [{
                        required: true,
                        message: "请输入用户名称",
                        trigger: "blur"
                    },
                    {
                        min: 2,
                        max: 10,
                        message: "长度在 2 到 5 个字符",
                        trigger: "blur"
                    }
                ],
                password: [{
                        required: true,
                        message: "请输入密码",
                        trigger: "blur"
                    },
                    {
                        min: 6,
                        max: 16,
                        message: "长度在 6 到 16 个字符",
                        trigger: "blur"
                    }
                ],
                repwd: [{
                    required: true,
                    validator: validateRepwd,
                    trigger: "blur"
                }],
                email: [{
                    required: true,
                    validator: validateEmail,
                    trigger: "blur"
                }],
                mobile: [{
                    required: true,
                    validator: validateMobile,
                    trigger: "blur"
                }]
            },
            loading : true ,
        };
    },
    created() {
        // 查询数据
        this.Load();
    },
    methods: {
        // 关闭角色对话框
        handelCloseRole(){
            this.formdata = {}
        },
       
        // 显示角色信息
        showRole(id){
            // 打开对话框
            this.dialogFormVisibleRole = true
            // 根据id 查询角色
            this.$http.get(`users/${id}`)
            .then(res=>{
                const {data,meta:{msg,status}} = res.data
                if(status === 200){
                    this.formdata = data 

                    // 处理-1  （当没有给用户分配角色时为-1）
                    this.formdata.rid = data.rid == -1? data.rid = undefined : data.rid
                }
            })
            // 获取用户角色列表
            this.$http.get(`roles`)
            .then(res=>{
                const {data,meta:{msg,status}} = res.data
                if(status === 200){
                    this.roles = data
                }
            })
        },
        // 角色分配
        handleRole(){
            if (this.formdata.rid === undefined) {
                this.$message.warning("请选择分配的角色")
                return
            }
            // 发送请求分配角色
            this.$http.put(`users/${this.formdata.id}/role`,this.formdata)
            .then(res=>{
                const {data,meta:{msg,status}} = res.data
                if (status === 200) {
                    // 关闭对话框
                    this.dialogFormVisibleRole = false
                    this.$message.success(msg)
                }else{
                    this.$message.error(msg)
                }
            })
        },

        // 获取反填信息
        showData(id) {
            this.$http.get(`users/${id}`)
                .then(res => {
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data;
                    if (res.status === 200) {
                        this.formdata = data;
                    }
                });
        },
        // 修改用户信息
        handelEdit(id) {
            this.$http.put(`users/${id}`, this.formdata)
                .then(res => {
                    // 解构
                    const {
                        data,
                        meta: {
                            msg,
                            status
                        }
                    } = res.data
                    if (status === 200) {
                        this.Load()
                        this.$message.success(msg)
                        // 关闭对话框
                        this.dialogFormVisibleEdit = false
                    } else {
                        this.$message.error(msg)
                    }
                })
        },
        // 关闭修改用户窗口
        handleCloseEdit(){
            this.formdata = {}
        },
        // 增加用户
        handelAdd() {
            this.$refs["ruleForm"].validate(valid => {
                if (valid) {
                    this.$http.post(`users`, this.formdata).then(res => {
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
                            this.dialogFormVisibleAdd = false;
                        } else {
                            this.$message.error(msg);
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        // 关闭添加窗口
        handelClose() {
            // 清空所有表单数据
            this.formdata = {};
        },
        // 修改用户状态
        handelState(id, state) {
            this.$http.put(`users/${id}/state/${state}`).then(res => {
                // 解构data
                const {
                    data,
                    meta: {
                        msg,
                        status
                    }
                } = res.data;
                if (status === 200) {
                    //   成功后刷新页面
                    this.Load();
                    this.$message.success(msg);
                }
            });
        },
        // 删除用户
        handelDelete(id) {
            this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                .then(() => {
                    this.$http.delete(`users/${id}`).then(res => {
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
       async Load() {
            // query={查询的字段}  pagenum={当前页}  pagesize={每页数据条数}
          await  this.$http
                .get(
                    `users?query=${this.searchValue}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
                )
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
                        this.users = data.users;
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
    }
};
</script>

<style scoped>
.row {
    margin: 20px 0;
}

.addbtn {
    margin-left: 10px;
}

.pageHelp {
    text-align: center;
    margin: 20px 0;
}
</style>
