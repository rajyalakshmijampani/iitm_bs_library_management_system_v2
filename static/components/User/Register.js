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
                <h1 style="color: #015668;">New User Registration</h1>
                <br>
                <div style="margin: auto; color: red;">
                    {{ error }}
                </div>
                <div style="margin: auto; color: green;">
                    {{ success }}
                </div>
                <br>
                <div class="form-floating" style="width: 75%;margin: auto">
                    <input type="text" class="form-control" name="name" placeholder="Name" 
                            v-model='cred.name' autofocus required>
                    <label for="name">Name</label>
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
                <button type="submit" class="btn btn-success" 
                    style="background-color: #015668;" @click='login'>Login</button> 
                <br><br>
                <a href="/register">New User? Register!</a>
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
            error: null
        }
    },
    components:{
        Libdashboard,
        Userdashboard,
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
            console.log(data)
            if (res.ok) {
                localStorage.setItem('auth-token', data.token)
                if (data.role=='admin') this.$router.push({path : '/libdashboard'})
                else if (data.role=='user') this.$router.push({path : '/userdashboard'})
            }
            else{
                this.error = data.message
            }
        }
    }
}