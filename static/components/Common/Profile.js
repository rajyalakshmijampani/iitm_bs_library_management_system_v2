import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
    <div class="col">
        <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 7vh;align-items: center;">
            <div style="padding-left: 0; color: red;" v-if="error">
                {{ error }}
                <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
            </div>
        </div>
        <div class="row mb-3">
            <h2 style="color: #015668">Edit Profile</h2>
        </div>
        <div class="row mb-3">
            <label for="name" class="col-sm-2 col-form-label">Name<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="name" v-model='user.name' style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="email" class="col-sm-2 col-form-label">Email<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="email" v-model='user.email' style="border:1px solid">
            </div>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="user.name === null || user.name === '' || user.email === null || user.email === ''" 
                        @click='updateProfile'>Update</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            user :{
                name: JSON.parse(localStorage.getItem('user')).name,
                email: JSON.parse(localStorage.getItem('user')).email
            },
            id: JSON.parse(localStorage.getItem('user')).id,
            token: JSON.parse(localStorage.getItem('user')).token,
            error: null
        }
    },
    components: {
        Navbar,
    },
    methods: {
        clearMessage() {
            this.error = null
        },
        goBack(){
            this.$router.push('/books')
        },
        async updateProfile(){
            const res = await fetch(`/updateProfile/${this.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify(this.user),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                var user = JSON.parse(localStorage.getItem('user'));
                user.name = this.user.name;
                user.email = this.user.email;

                var updatedUserData = JSON.stringify(user);
                localStorage.setItem('user', updatedUserData);
                
                this.$router.go(0)
            }
            else{
                this.error = data.message
            }
        },
    }
}