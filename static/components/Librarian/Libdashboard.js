import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
        <div class="col">
            <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 7vh;align-items: center;">
                <div style="padding-left: 0;color:red;" v-if="error">
                    {{ error }}
                    <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
                </div>
            </div>
            <div> Welcome Lib </div>
        </div>
    </Navbar>
    `,
    components:{
        Navbar,
    },
    data() {
        return {
            error: null
        }
    },
}