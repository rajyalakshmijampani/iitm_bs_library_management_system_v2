import Libdashboard from "/static/components/Librarian/Libdashboard.js"
import Userdashboard from "/static/components/User/Userdashboard.js"

export default {
    template: `
    <div class="row">
        <div class="col">
            <img src="http://localhost:5000/static/images/home.jpg" style="width:100%; height :100vh; background-size: cover;"/>
        </div>
        <div class="col">
            <a class="navbar-brand" href="/">
                <img src="http://localhost:5000/static/images/logo.png" alt="ClickReads" height="60" style="margin-top:5vh;">
            </a>
            <div style="text-align: center;margin-top:3vh; margin-bottom:8vh;align-items:center">
                <br><br><br>
                <h1 style="color: #015668;">Login to continue..!</h1>
                <br>
                <div style="margin: auto; color: red;">
                    {{ error }}
                </div>
                <br>
                <div class="form-floating" style="width: 75%;margin: auto">
                    <input type="email" class="form-control" name="email" placeholder="Email address" 
                            v-model='cred.email' autofocus required>
                    <label for="email">Email address</label>
                </div>
                <br>
                <div class="form-floating" style="width: 75%;margin: auto">
                    <input type="password" class="form-control" name="password" 
                        placeholder="Password" v-model='cred.password' required>
                    <label for="password">Password</label>
                </div>
                <br>   
                <button class="btn btn-success" style="background-color: #015668;" 
                    :disabled="cred.email === null || cred.email === '' || 
                               cred.password === null || cred.password === ''" @click='login'>Login</button> 
                <br><br>
                <router-link to="/register">New User? Register!</router-link>
            </div>    
        </div>
    </div>
    `,
    data() {
        return {
            cred: {
                email: null,
                password: null,
            },
            error: this.$route.params.error
        }
    },
    components:{
        Libdashboard,
        Userdashboard
    },
    methods: {
        async login() {
            const res = await fetch('/user_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.cred),
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem('auth-token', data.token)
                localStorage.setItem('role', data.role)
                if (data.role=='admin') this.$router.push({path : '/libdashboard'})
                else if (data.role=='user') this.$router.push({path : '/userdashboard'})
            }
            else{
                this.error = data.message
            }
        }
    }
}