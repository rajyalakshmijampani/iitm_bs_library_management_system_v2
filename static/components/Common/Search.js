import Book from "../Book/Book.js"
import Section from "../Section/Section.js"
import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
    <div class="col">
        <div class="row mb-3" style="width:100%;text-align:center;margin-top:3%">
            <h3 style="color: #015668">Search the knowledge base</h3>
            <div style="display: flex;width:60%;margin-top:1%;margin-left:20%">
                <select class="form-select" v-model='param' style="width: 100%;">
                    <option value="name" selected>Book</option>
                    <option value="section">Section</option>
                    <option value="author">Author</option>
                </select>
                <input type="text" class="form-control" v-model='value' style="width: 400%;margin-left: 1%; margin-right: 1%;" placeholder="Type here...">
                <button class="btn btn-primary" style="background-color: #015668;border-color:#015668" @click='search'>
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
        <hr style="margin-top:2%">
        <div class="row mb-1">
            <div class="heading" style="width: 70%; align-items: center; display: flex;justify-content: space-between">
                <h4 style="color: #015668;margin-left: 0">{{no_of_results}} search result(s) found.</h4>
            </div>
        </div>
        <div class="row" style="margin-top:3vh;" v-if="param=='name'|| param=='author'">
            <b-container>
                <b-row>
                    <b-col v-for="(book,index) in paginatedBooks" :key="index" cols="3" class="mb-3">
                        <Book :book="book" :page="location"/>
                    </b-col>
                </b-row>
                <p style="margin-top:5%;margin-left:42%">Showing 8 results per page</p>
                <b-pagination  v-model="currentPage" :total-rows="totalBooks" :per-page="booksPerPage" style="justify-content:center"/>
            </b-container>
        </div>
        <div class="row" style="margin-top:3vh;" v-if="param=='section'">
            <div v-for="(sec,index) in search_results" :key="index" class="mb-3">
                <Section :section="sec"/>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            role: JSON.parse(localStorage.getItem('user')).role,
            param: 'name',
            value: '',
            location: 'search_results',
            no_of_results:0,
            search_results:[],
            currentPage: 1,
            booksPerPage: 8,
        }
    },
    computed: {
        totalBooks() {
          return this.search_results.length;
        },
        paginatedBooks() {
          const start = (this.currentPage - 1) * this.booksPerPage;
          const end = start + this.booksPerPage;
          return this.search_results.slice(start, end);
        }
      },
    components: {
        Navbar,
        Book,
        Section
    },
    methods: {
        async search(){
            if (this.param=='name' || this.param=='author'){
                const res = await fetch('/book/all', {
                    headers: {
                        "Authentication-Token": this.token
                        }
                    })
                if (res.ok) {
                    const data = await res.json()
                    if (this.param == 'name'){
                        this.search_results = data.filter(item => item.name.toLowerCase().includes(this.value.toLowerCase()))
                    }
                    else if (this.param == 'author'){
                        this.search_results = data.filter(item => item.author.toLowerCase().includes(this.value.toLowerCase()))
                    }
                    this.no_of_results = Object.keys(this.search_results).length
                }
            }
            else if (this.param=='section'){
                const res = await fetch('/section/all', {
                    headers: {
                        "Authentication-Token": this.token
                        }
                    })
                if (res.ok) {
                    const data = await res.json()
                    this.search_results = data.filter(item => item.name.toLowerCase().includes(this.value))
                    this.no_of_results = Object.keys(this.search_results).length
                    }
            }
        }
    },
}