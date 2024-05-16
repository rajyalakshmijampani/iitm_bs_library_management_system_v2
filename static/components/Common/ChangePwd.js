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
            <h2 style="color: #015668">Change Password</h2>
        </div>
        <div class="row mb-3">
            <label for="oldpwd" class="col-sm-2 col-form-label">Old Password<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="password" class="form-control" name="oldpwd" v-model='user.oldpwd' style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="newpwd" class="col-sm-2 col-form-label">New Password<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="password" class="form-control" name="newpwd" v-model='user.newpwd' 
                        @input="checkPasswordsMatch" style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="cnfpwd" class="col-sm-2 col-form-label">Confirm New Password<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="password" class="form-control" name="cnfpwd" v-model='cnfpwd' 
                        @input="checkPasswordsMatch" style="border:1px solid">
            </div>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="user.oldpwd === null || user.oldpwd === '' ||
                                     user.newpwd === null || user.newpwd === '' ||
                                     user.newpwd !== cnfpwd" 
                        @click='changePwd'>Update</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            user :{
                oldpwd: null,
                newpwd: null
            },
            cnfpwd: null,
            id: JSON.parse(localStorage.getItem('user')).id,
            token: JSON.parse(localStorage.getItem('user')).token,
            error: null
        }
    },
    components: {
        Navbar,
    },
    methods: {
        checkPasswordsMatch(){
            if (this.user.newpwd === this.cnfpwd)
                this.error = null
            else
                this.error = 'Passwords do not match'
        },
        clearMessage() {
            this.error = null
        },
        goBack(){
            this.$router.back()
        },
        async changePwd(){
            const res = await fetch(`/changePwd/${this.id}`, {
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
                this.$router.go(0)
            }
            else{
                this.error = data.message
            }
        },
    }
}