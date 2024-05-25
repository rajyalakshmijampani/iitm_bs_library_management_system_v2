import Section from "./Section.js";
import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
    <div class="col">
        <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 7vh;align-items: center;">
            <div style="padding-left: 0; color:red;" v-if="error">
                {{ error }}
                <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
            </div>
        </div>
        <div class="row mb-1">
            <div class="heading" style="width: 70%; align-items: center; display: flex;justify-content: space-between">
                <h4 style="color: #015668;margin-left: 0">{{no_of_sections}} section(s) available.</h4>
                <router-link to="/sections/add" tag="button" class="button-link" v-if="role=='admin'"
                            style="background-color: #015668; color: white; border-radius: 9px;  padding: 8px 10px;">
                    <i class="fas fa-plus"></i>
                    Add Section
                </router-link>
            </div>
        </div>
        <div class="row" style="margin-top:6vh;">
            <div v-for="(section,index) in allSections" :key="index" class="mb-3">
                <Section :section="section"/>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            allSections: [],
            token: JSON.parse(localStorage.getItem('user')).token,
            role: JSON.parse(localStorage.getItem('user')).role,
            no_of_sections: 0,
            error: null
        }
    },
    components: {
        Navbar,
        Section
    },
    created() {
        this.loadSections();
    },
    methods: {
        clearMessage() {
            this.error = null
        },
        async loadSections() {
            const res = await fetch('/section/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.allSections = data
                this.no_of_sections = Object.keys(data).length
                }
        },
    }
}