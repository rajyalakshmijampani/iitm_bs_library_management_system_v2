import Navbar from "/static/components/Common/Navbar.js"
import config from '/static/config.js';

export default {
    template: `
    <Navbar>
    <div class="col">
        <div class="row" style="margin : 2vh 0 2vh 0; width:40%; height: 7vh;align-items: center;">
            <div style="padding-left: 0; color: red;" v-if="error">
                {{ error }}
                <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
            </div>
        </div>
        <div class="row mb-3">
            <h2 style="color: #015668">Select book(s) and user</h2>
        </div>
        <div class="row mb-3" style="width:75%">
            <div class="col">
                <h5>Available Books</h5>
                </br>
                <b-form-checkbox v-model="allSelected" aria-describedby="flavours" aria-controls="flavours" @change="toggleAll" style="font-size: 1.1rem;margin-left:1%">
                    <span style="margin-left: 10px;"> {{ allSelected ? 'Un-select All' : 'Select All' }}</span>
                </b-form-checkbox>
                <b-form-checkbox-group v-model="localSelectedBooks" style="margin-left:4%;margin-top:1%">
                        <b-form-checkbox v-for="book in available_books" :key="book.id" :value="book.id" style="font-size: 1.1rem; margin-bottom:0.8%">
                            <span style="margin-left: 10px;">{{ book.name }} ( {{ book.author }} )</span>
                        </b-form-checkbox>
                </b-form-checkbox-group>
            </div>
            <div class="col">
                <div style="display:flex;">
                    <h5>Available Users</h5>
                    <small class="fw-normal" style="margin-left:5px">(In brackets, current no. of e-book holdings. Max: {{max_books_allowed}})</small>
                </div>
                </br>
                <b-form-radio-group v-model="selected_user" :options="userList" plain stacked></b-form-radio-group>
            </div>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="localSelectedBooks.length==0 || selected_user.id==undefined" 
                        @click='issueBooks'>Issue Books</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            error: null,
            available_books : [],
            userList : null,
            selected_user: {},
            allSelected: false,
            max_books_allowed: config.MAX_BOOKS_ALLOWED,
            localSelectedBooks: [...this.selected_books]
        }
    },
    components: {
        Navbar,
    },
    props:{selected_books:{default: () => []}},
    created(){
        this.loadBooks()
    },
    async mounted() {
        const users = await this.fetchUsers();
    
        // Array of promises to fetch book counts
        const userPromises = users.map(async (user) => {
          const booksCount = await this.fetchUserBooks(user.id);
          return {
            text: `${user.name} (${booksCount})`,
            value: {'id':user.id,'max':this.max_books_allowed - booksCount}
          };
        });
    
        this.userList = await Promise.all(userPromises);
    },
    methods: {
        toggleAll(checked) {
            this.localSelectedBooks = checked ? Object.values(this.available_books).map(book => book.id) : []
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
                this.available_books = all_books.filter(book => book.status=='AVAILABLE')
                }
        },
        async fetchUsers(){
            const response = await fetch('/user/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                });
            const users = await response.json();
            return users;
        },
        async fetchUserBooks(userId) {
            const response = await fetch(`/user/${userId}/currentbooks`, {
                headers: {
                    "Authentication-Token": this.token
                    }
                });
            const books = await response.json();
            return books.issues.length+books.requests.length;
        },
        async issueBooks(){
            if (this.localSelectedBooks.length > this.selected_user.max){
                this.error = "Cannot issue more than " + this.selected_user.max + " books to the selected user."
            }
            else{
                this.error = null
                const res = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'ISSUE',
                        'book_ids' : this.localSelectedBooks,
                        'user_id' : this.selected_user.id
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
        localSelectedBooks(newValue) {
                // Handle changes in individual section checkboxes
                if (newValue.length === 0) {
                    this.allSelected = false
                } else if (newValue.length === this.available_books.length) {
                    this.allSelected = true
                } else {
                    this.allSelected = false
                }
            }
        }
}