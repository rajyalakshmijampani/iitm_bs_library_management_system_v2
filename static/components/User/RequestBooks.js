import Navbar from "/static/components/Common/Navbar.js"
import config from '/static/config.js';

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
            <h2 style="color: #015668">Select books to request</h2>
        </div>
        <div class="row mb-3">
            <p>Max limit : {{ max_books_allowed }}, Current Holidings : {{this.user_current_books.issues.length+this.user_current_books.requests.length}}
            ( Issued : {{this.user_current_books.issues.length}}, Requested : {{this.user_current_books.requests.length}} )</p>
        </div>
        <div class="row mb-3">
            <b-form-checkbox v-model="allSelected" aria-describedby="flavours" aria-controls="flavours" @change="toggleAll" style="font-size: 1.1rem;">
                <span style="margin-left: 10px;"> {{ allSelected ? 'Un-select All' : 'Select All' }}</span>
            </b-form-checkbox>
            <b-form-checkbox-group v-model="selected_books" style="margin-left:3%;margin-top:1%">
                    <b-form-checkbox v-for="book in possible_books" :key="book.id" :value="book.id" style="font-size: 1.1rem; margin-bottom:0.8%">
                        <span style="margin-left: 10px;">{{ book.name }} ( {{ book.author }} )</span>
                    </b-form-checkbox>
            </b-form-checkbox-group>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="selected_books.length==0" 
                        @click='requestBooks'>Request Selected</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            user_id: JSON.parse(localStorage.getItem('user')).id,
            possible_books: [],
            user_current_books: {'issues':[],'requests':[]},
            error: null,
            selected_books: [],
            allSelected: false,
            max_books_allowed: config.MAX_BOOKS_ALLOWED
        }
    },
    components: {
        Navbar,
    },
    created(){
        this.loadBooks()
        this.userBooks()
    },
    methods: {
        toggleAll(checked) {
            this.selected_books = checked ? Object.values(this.possible_books).map(book => book.id) : []
        },
        clearMessage() {
            this.error = null
        },
        goBack(){
            this.$router.back()
        },
        async loadBooks(){
            const res = await fetch('/book/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const all_books = await res.json()
                this.possible_books = all_books.filter(book => book.status=='AVAILABLE')
                }
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
        async requestBooks(){
            const no_of_requests_allowed = this.max_books_allowed - (this.user_current_books.issues.length+this.user_current_books.requests.length)
            if (this.selected_books.length > no_of_requests_allowed) {
                this.error = "Max. "+no_of_requests_allowed+" new requests allowed"
            }
            else{
                this.error = null
                const res = await fetch('/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'REQUEST_MANY',
                        'book_ids' : this.selected_books
                    })
    
                })
                const data = await res.json()
                if (res.ok) {
                    alert(data.message)
                    this.$router.go(0)
                }
                else {
                    this.error = data.message
                }

            }

        }
    },
    watch: {
        selected_books(newValue) {
                // Handle changes in individual section checkboxes
                if (newValue.length === 0) {
                    this.allSelected = false
                } else if (newValue.length === this.possible_books.length) {
                    this.allSelected = true
                } else {
                    this.allSelected = false
                }
            }
        }
}