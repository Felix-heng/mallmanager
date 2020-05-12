<template>
  <div class="login">
    <el-form
      label-position="top"
      label-width="80px"
      :rules="rules"
      :model="formData"
      class="form-login"
      ref="rulesform"
    >
      <h2>用户登录</h2>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" show-password></el-input>
      </el-form-item>
      <el-button type="primary" class="loginBtn" @click="handelFrom('rulesform')">主要按钮</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据
      formData: {
        username: "admin",
        password: "123456"
      },
      // 表单校验规则
      rules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [
          {
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
        ]
      }
    };
  },
  methods: {
    // 登录
    handelFrom(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // 发送网络请求   请求路径：login 
            this.$http.post('login',this.formData)
            .then(res=>{
              // 处理结果  将res.data 解构成 data 和msg status,解构后得到相应的值
              let {data,meta:{msg,status}} = res.data
              if(status === 200){
                // 登录成功  
                this.$message.success(msg)
                // 存储 token  登录成功后会产生一个token凭证 
                localStorage.setItem('token',data.token)
                // 登陆成功后跳到主页   home组件中 有默认子路由 就要使用path
                this.$router.push({path:'/'})
              }else{
                this.$message.error(msg)
              }
              
              
            })
          } else {
            return false;
          }
        });
      },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loginBtn {
  width: 100%;
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #354151;
}
.form-login {
  background-color: #fff;
  width: 450px;
  padding: 20px;
  border-radius: 10px;
}
</style>
