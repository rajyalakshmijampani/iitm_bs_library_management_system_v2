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
            <h2 style="color: #015668">Section Details</h2>
        </div>
        <div class="row mb-3">
            <label for="name" class="col-sm-2 col-form-label">Name<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="name" v-model='section.name' style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="author" class="col-sm-2 col-form-label">Description<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <textarea class="form-control" name="description" v-model='section.description' style="border:1px solid;resize: both;"></textarea>
            </div>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="section.name === null || section.name === '' ||
                                    section.description === null || section.description === '' " 
                        @click='createSection'>Create</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            section: {
                name: null,
                description: null
            },
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
            this.$router.back()
        },
        async createSection(){
            const res = await fetch('/section/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify(this.section),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.push('/sections')
            }
            else{
                this.error = data.message
            }
        }
    },
}