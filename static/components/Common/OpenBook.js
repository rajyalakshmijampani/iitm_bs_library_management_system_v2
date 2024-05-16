import Navbar from "/static/components/Common/Navbar.js"

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
        <div class="row">
            <div class="col" style="width:60%">
                <div class="row mb-3">
                    <h2 style="color: #015668">Book Details</h2>
                </div>
                </br>
                <div class="row mb-3">
                    <label for="name" class="col-sm-3 col-form-label">Name<sup style="color: red;"> * </sup></label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="name" :disabled="role!='admin'" 
                                v-model='book.name' style="border:1px solid">
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="author" class="col-sm-3 col-form-label">Author(s)<sup style="color: red;"> * </sup></label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="author" :disabled="role!='admin'" 
                                v-model='book.author' style="border:1px solid">
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="section" class="col-sm-3 col-form-label">Section</label>
                    <div class="col-sm-4">
                        <div class="dropdown">
                            <select class="form-select" v-model="book.section" :disabled="role!='admin'" 
                                    style="border:1px solid">
                                <option value=null>--Select--</option>
                                <option v-for="(section, index) in allSections" :key="index" :value="section.name">{{section.name}}</option>
                            </select>
                        </div>            
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="name" class="col-sm-3 col-form-label">Price<sup style="color: red;"> * </sup></label>
                    <div class="col-sm-3">
                        <input type="number" class="form-control" name="price" :disabled="role!='admin'"
                                v-model='book.price' style="border:1px solid">
                    </div>
                </div>
                <br>
                <div v-if="role=='admin'">
                    <input type="file" accept=".txt" @change='readContent'><br>
                        <sub class="text-muted">Allowed file type: .txt</sub><br>
                        <sub>Leave blank to retain the existing file. Upload new file to replace</sub>
                </div>
                <div class="form-group" style="margin-top: 2%;">
                    <label class="col-md-4 control-label" for="submit"></label>
                    <div class="col-md-8">
                        <button class="btn btn-success" v-if="role=='admin'" style="margin-right: 2%; background-color: #015668" 
                                :disabled="book.name === null || book.name === '' ||
                                            book.author === null || book.author === '' ||
                                            book.price===null || book.price === '' || error !==null " 
                                @click='updateBook'>Update</button>
                        <button class="btn btn-default" style="border-color: #015668" @click='goBack'>Back</button>
                    </div>
                </div>
            </div>
            <div class="col" style="width:40%">
                <div class="row mb-3" v-if="role=='user'" style="display: flex; width: 50%;">
                    <p style="display: flex; width: 40%; align-items: center; margin-bottom:0">Your Rating:</p>
                    <select class="form-select" v-model="book.rating" style="width: 33%; margin-right: 2%;">
                        <option value=0 >--Rate--</option>
                        <option v-for="rating in 5" :key="rating" :value="rating">{{rating}}</option>
                    </select>
                    <button class="btn btn-default" style="width:25%;border-color: #015668" 
                            :disabled="book.rating == 0" @click='submitRating'>Submit</button>
                </div>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            book: {
                name: null,
                author: null,
                section: null,
                price: null,
                content: null,
                rating: 0
            },
            id: this.$route.query.id,
            token: JSON.parse(localStorage.getItem('user')).token,
            role: JSON.parse(localStorage.getItem('user')).role,
            allSections: null,
            error: 'Bla'
        }
    },
    components: {
        Navbar,
    },
    created() {
        this.loadSections();
        this.loadBookData();
        if(this.role=='user')
            this.loadUserBookData();
    },
    methods: {
        clearMessage() {
            this.error = null
        },
        goBack(){
            this.$router.back()
        },
        readContent(event) {
            const file = event.target.files[0];
            if (file){
                if (file.type != "text/plain"){
                    this.book.content = null
                    this.error= 'Unsupported file type'
                }
                else{
                    this.error = null
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (reader.result)
                            this.book.content = reader.result
                        else
                            this.error = 'File is empty'
                            this.book.content = null
                        };
                    reader.readAsText(file);
                }
            }            
        },
        async updateBook(){
            // const res = await fetch('/books/add', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authentication-Token': this.token
            //     },
            //     body: JSON.stringify(this.book),
            // })
            // const data = await res.json()
            // if (res.ok) {
            //     alert(data.message)
            //     this.$router.push('/books')
            // }
            // else{
            //     this.error = data.message
            // }
        },
        async loadSections() {
            const res = await fetch('/sections', {
                headers: {
                    'Content-Type': 'application/json',
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.allSections = data
                }
        },
        async loadBookData(){
            const res = await fetch(`/books/${this.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
            })
            if (res.ok) {
                const data = await res.json()
                this.book.name = data.name
                this.book.author = data.author
                this.book.section = data.section.name
                this.book.price = data.price
            }
        },
        async loadUserBookData(){
            
        },
        async submitRating(){
            const res = await fetch(`/books/rate/${this.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify({"rating":this.book.rating})
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)
            }
            else{
                this.error = data.message
            }
        }
    }
}