import Navbar from "/static/components/Common/Navbar.js"

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
            <h2 style="color: #015668">Select book(s) to revoke</h2>
        </div>
        <div class="row mb-3" style="width:75%">
            <div class="col">
                <b-form-checkbox v-model="allSelected" aria-describedby="flavours" aria-controls="flavours" @change="toggleAll" style="font-size: 1.1rem;margin-left:1%">
                    <span style="margin-left: 10px;"> {{ allSelected ? 'Un-select All' : 'Select All' }}</span>
                </b-form-checkbox>
                <b-form-checkbox-group v-model="selectedBooks" style="margin-left:4%;margin-top:1%">
                        <b-form-checkbox v-for="book in bookList" :key="book.id" :value="book.id" style="font-size: 1.1rem; margin-bottom:0.8%">
                            <span style="margin-left: 10px;">{{ book.name }} -- Issued to {{book.issued_to.name}}</span>
                        </b-form-checkbox>
                </b-form-checkbox-group>
            </div>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="selectedBooks.length==0" 
                        @click='revokeBooks'>Revoke Books</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            error: null,
            bookList : [],
            allSelected: false,
            selectedBooks: []
        }
    },
    components: {
        Navbar,
    },
    created(){
        this.loadBooks()
    },
    methods: {
        toggleAll(checked) {
            this.selectedBooks = checked ? Object.values(this.bookList).map(book => book.id) : []
        },
        clearMessage() {
            this.error = null
        },
        goBack(){
            this.$router.back()
        },
        async loadBooks(){
            const response = await fetch('/book/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                });
            const books = await response.json();
            this.bookList = books.filter(book => book.status =='ISSUED');
        },
        async revokeBooks(){
            const res = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'REVOKE_MANY',
                        'book_ids' : this.selectedBooks
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
    },
    watch: {
        selectedBooks(newValue) {
                // Handle changes in individual section checkboxes
                if (newValue.length === 0) {
                    this.allSelected = false
                } else if (newValue.length === this.bookList.length) {
                    this.allSelected = true
                } else {
                    this.allSelected = false
                }
            }
        }
}