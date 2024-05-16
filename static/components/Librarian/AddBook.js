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
        <div class="row mb-3">
            <h2 style="color: #015668">Book Details</h2>
        </div>
        <div class="row mb-3">
            <label for="name" class="col-sm-2 col-form-label">Name<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="name" v-model='book.name' style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="author" class="col-sm-2 col-form-label">Author(s)<sup style="color: red;"> * </sup></label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="author" v-model='book.author' style="border:1px solid">
            </div>
        </div>
        <div class="row mb-3">
            <label for="section" class="col-sm-2 col-form-label">Section</label>
            <div class="col-sm-3">
                <div class="dropdown">
                    <select class="form-select" v-model="book.section" style="border:1px solid">
                        <option value="">--Select--</option>
                        <option v-for="(section, index) in allSections" :key="index" :value="section.name">{{section.name}}</option>
                    </select>
                </div>            
            </div>
        </div>
        <div class="row mb-3">
            <label for="name" class="col-sm-2 col-form-label">Price<sup style="color: red;"> * </sup></label>
            <div class="col-sm-2">
                <input type="number" class="form-control" name="price" v-model='book.price' style="border:1px solid">
            </div>
        </div>
        <br>
        <div>
            <input type="file" accept=".txt" @change='readContent'><br>
                <sub class="text-muted">Allowed file type: .txt</sub>
        </div>
        <div class="form-group" style="margin-top: 2%;">
            <label class="col-md-4 control-label" for="submit"></label>
            <div class="col-md-8">
                <button class="btn btn-success" style="margin-right: 1%; background-color: #015668" 
                        :disabled="book.name === null || book.name === '' ||
                                    book.author === null || book.author === '' ||
                                    book.price===null || book.price === '' || book.content=== null" 
                        @click='createBook'>Create</button>
                <button class="btn btn-default" style="margin-left: 1%; border-color: #015668" @click='goBack'>Cancel</button>
            </div>
        </div>
    </div>
    </Navbar>`,
    data() {
        return {
            book: {
                name: null,
                author: null,
                section: '',
                price: null,
                content: null
            },
            token: JSON.parse(localStorage.getItem('user')).token,
            allSections: null,
            error: null
        }
    },
    components: {
        Navbar,
    },
    created() {
        this.loadSections();
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
                    };
                reader.readAsText(file);
            }
        },
        async createBook(){
            const res = await fetch('/books/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify(this.book),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.push('/books')
            }
            else{
                this.error = data.message
            }
        },
        async loadSections() {
            const res = await fetch('/sections', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.allSections = data
                }
        },
    }
}