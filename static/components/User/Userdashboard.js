import Navbar from "/static/components/Common/Navbar.js"
import Book from "/static/components/Book/Book.js"

export default {
    template: `
    <Navbar>
        <div class="col">
            <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 5vh;align-items: center;">
                <div style="padding-left: 0;color:red;" v-if="error">
                    {{ error }}
                    <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
                </div>
            </div>
            <div class="row mb-3">
                <div>
                    <b-tabs content-class="mt-3" fill>
                        <b-tab title="My Holdings" active>
                            <h4 style="color: #015668;margin-left:2%;margin-top:2%"> You have {{this.user_current_books.issues.length}} books issued !! </h4>
                            <b-container style="margin-top:3%">
                                <b-row>
                                    <b-col v-for="(book,index) in user_current_books.issues" :key="index" cols="3" class="mb-3">
                                        <Book :book="book"/>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-tab>
                        <b-tab title="My Purchases">
                            <b-container>
                                <b-row>
                                    <b-col v-for="(book,index) in user_current_books.purchases" :key="index" cols="3" class="mb-3">
                                        <Book :book="book"/>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-tab>
                        <b-tab title="Pending Requests"><p>I'm the tab with the very, very long title</p></b-tab>
                        
                    </b-tabs>
                </div>
            </div>
        </div>
    </Navbar>
    `,
    components:{
        Navbar,
        Book
    },
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            user_id: JSON.parse(localStorage.getItem('user')).id,
            user_name: JSON.parse(localStorage.getItem('user')).name,
            user_current_books: {'issues':[],'requests':[],'purchases':[]},
            error: null
        }
    },
    created(){
        this.userBooks()
    },
    methods: {
        clearMessage() {
            this.error = null
        },
        async userBooks(){
            const res = await fetch(`/user/${this.user_id}/currentbooks`, {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.user_current_books = data
                }
        },
    }
}