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
        <div class="row mb-3">
            <div class="heading" style="width: 70%; align-items: center; display: flex;justify-content: space-between">
                <h4 style="color: #015668;margin-left: 0">{{no_of_books}} book(s) available.</h4>
                <router-link to="/books/add" tag="button" class="button-link" v-if="role=='admin'"
                            style="background-color: #015668; color: white; border-radius: 9px;  padding: 8px 10px;">
                    <i class="fas fa-plus"></i>
                    Add Book
                </router-link>
            </div>
        </div>
        <div class="row" style="margin-top:8vh;">
            <b-container>
                <b-row>
                    <b-col v-for="(book,index) in allBooks" :key="index" cols="3" class="mb-3">
                        <b-card style="width:85%;border:1px solid #015668">
                            <router-link :to="{ path: '/books/open', query: { id: book.id } }">
                                <b-card-img src="http://localhost:5000/static/images/image.png" alt="Image" 
                                            img-top style="width:75%;margin-left:12%"></b-card-img>
                            </router-link></br>
                            <p class="card-text" style="margin-top:2vh"><b>{{book.name}}</b></p>
                            <div style="display: flex;justify-content: space-between;align-items:center;">
                                <p v-if="book.average_rating !== null" style="margin-bottom:0;"> Avg. Rating: {{ book.average_rating }}</p>
                                <p v-else style="margin-bottom:0;">No ratings yet</p>
                                <b-button class="btn-outline-danger" style="background-color:white; color:crimson;" 
                                    v-if="role=='admin'" @click='confirmDelete(book.id,book.name)'>
                                    <i class="fa-regular fa-trash-can"></i> Delete
                                </b-button>
                            </div>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            allBooks: null,
            token: localStorage.getItem("auth-token"),
            role: localStorage.getItem("role"),
            no_of_books: 0,
            error: null
        }
    },
    components: {
        Navbar,
    },
    created() {
        this.loadBooks();
      },
    methods: {
        clearMessage() {
            this.error = null
        },
        async downloadBook(id,name){
            const res = await fetch(`/books/download/${id}`, {
                headers: {
                  'Authentication-Token': this.token,
                },
              })
            if (res.ok) {
                const data = await res.json()
                const contentBytes = new TextEncoder().encode(data.content);
                const blob = new Blob([contentBytes], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', name+'.txt'); // Set the filename
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }
        },
        confirmDelete(book_id,book_name){
            var result = confirm("Are you sure you want to delete the book '" + book_name + "' ?");
            if (result)
                this.deleteBook(book_id)
        },
        async deleteBook(id){
            const res = await fetch(`/books/delete/${id}`, {
                headers: {
                  'Authentication-Token': this.token,
                },
              })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                window.location.reload();
            }
        },
        async loadBooks() {
            const res = await fetch('/books', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.allBooks = data
                this.no_of_books = Object.keys(data).length
                }
        },
    }
}