import Book from "./Book.js";
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
        <div class="row" style="margin-top:3vh;">
            <b-container>
                <b-row>
                    <b-col v-for="(book,index) in allBooks" :key="index" cols="3" class="mb-3">
                        <Book :book="book"/>
                    </b-col>
                </b-row>
            </b-container>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            allBooks: [],
            token: JSON.parse(localStorage.getItem('user')).token,
            role: JSON.parse(localStorage.getItem('user')).role,
            no_of_books: 0,
            error: null
        }
    },
    components: {
        Navbar,
        Book
    },
    created() {
        this.loadBooks();
      },
    methods: {
        clearMessage() {
            this.error = null
        },
        async downloadBook(id,name){
            const res = await fetch(`/book/download/${id}`, {
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
        async loadBooks() {
            const res = await fetch('/book/all', {
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