export default {
    template: `
    <div class="mb-3 p-2" style="text-align: center;width: 30%;border: 3px solid #015668;margin: 7% auto;">
        <h1 style="color: #015668;">User Login</h1>
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
        <br>
    </div>
    `,
    data(){
        return {
            cred:{
                email: null,
                password : null,
            },
        }
    },
    methods: {
        async login(){
            const res = await fetch('/user_login',{
                method : 'POST',
                headers : {
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(this.cred),
            })
            if (res.ok){
                const data = await res.json()
                localStorage.setItem('auth-token',data.token)
                this.$router.push('/')
            }
        }
    }
}