import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
    <div class="col">
        <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 7vh;align-items: center;">
            <div :style="{ color: message_type === 'error' ? 'red' : 'green' }" v-if="message" style="padding-left: 0;">
                {{ message }}
                <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
            </div>
        </div>
        <div class="row mb-3">
            <div class="heading" style="width: 70%; align-items: center; display: flex;justify-content: space-between">
                <h4 style="color: #015668;margin-left: 0">{{no_of_books}} book(s) available.</h4>
                <router-link to="/books/add" tag="button" class="button-link" 
                            style="background-color: #015668; color: white; border-radius: 9px;  padding: 8px 10px;">
                    <i class="fas fa-plus"></i>
                    Add Book
                </router-link>
            </div>
        </div>
        <div class="row">
            <table class="table table-hover" style="width: 80%; justify-content: space-between; margin-top: 1vh"> 
                <thead>
                    <tr>
                        <th style="width: 20%; color: #015668; text-align: center">Book ID</th>
                        <th style="width: 30%; color: #015668; text-align: center">Name</th>
                        <th style="width: 20%; color: #015668; text-align: center">Section</th>
                        <th style="width: 30%; color: #015668; text-align: center" v-if="role=='admin'">Actions</th>
                        <th style="width: 30%; color: #015668; text-align: center" v-if="role=='user'">Author</th>
                    </tr>
                </thead>
                <tbody style="text-align: center">
                    <tr v-for="(book,index) in allBooks" :key="index">
                        <td style="vertical-align: middle;">{{book.id}}</td>
                        <td style="vertical-align: middle;">{{book.name}}</td>
                        <td style="vertical-align: middle;">Section</td>
                        <td v-if="role=='admin'" style="vertical-align: middle;">
                            <router-link to="/books/add" tag="button" class="button-link" 
                                style="background-color: white; color: #015668; border: 2px solid #015668; border-radius: 9px;  padding: 6px 12px; vertical-align: middle;">
                                <i class="fa-solid fa-download"></i>
                            </router-link>
                            <router-link to="/books/add" tag="button" class="button-link" 
                                style="background-color: white; color: #015668; border: 2px solid #015668; border-radius: 9px;  padding: 6px 12px; vertical-align: middle;">
                                <i class="fa-regular fa-pen-to-square"></i>
                            </router-link>
                            <router-link to="/books/add" tag="button" class="button-link" 
                                style="background-color: white; color: crimson; border: 2px solid crimson; border-radius: 9px;  padding: 6px 12px; vertical-align: middle;">
                                <i class="fa-regular fa-trash-can"></i>
                            </router-link>
                        </td>
                        <td v-if="role=='user'" style="vertical-align: middle;">{{book.author}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            allBooks: null,
            token: localStorage.getItem("auth-token"),
            role: localStorage.getItem("role"),
            no_of_books: 0,
            message: null,
            message_type: null
        }
    },
    components: {
        Navbar,
    },
    created() {
        this.loadData();
      },
    methods: {
        clearMessage() {
            this.message = null
            this.message_type = null
        },
        async loadData() {
            const res = await fetch('/books', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json().catch((e) => {})
                this.allBooks = data
                this.no_of_books = Object.keys(data).length
                }
            else {
                this.message = res.statusText
                this.message_type = 'error'
                }
        },
    }
}