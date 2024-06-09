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
                    <h2 style="color: #015668; width:40%">Book Details</h2>
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
                    <label for="section" class="col-sm-3 col-form-label" style="display:flex;align-items:center">Section(s)</label>
                    <div class="col-sm-6" style="max-height: 200px;overflow-y: auto;margin-left: 12px;border: 1px solid black;border-radius: 10px;" >
                        <b-form-checkbox v-model="allSelected" aria-describedby="flavours" aria-controls="flavours" @change="toggleAll" :disabled="role!='admin'">
                            <span style="margin-left: 10px;"> {{ allSelected ? 'Un-select All' : 'Select All' }}</span>
                        </b-form-checkbox>
                        <b-form-checkbox-group v-model="book.sections">
                                <b-form-checkbox v-for="section in allSections" :key="section.id" :value="section.id" :disabled="role!='admin'">
                                    <span style="margin-left: 10px;">{{ section.name }}</span>
                                </b-form-checkbox>
                        </b-form-checkbox-group>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="name" class="col-sm-3 col-form-label">Price (INR)<sup style="color: red;"> * </sup></label>
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
            <div class="col" style="width:80%">
                <div class="row" style="display: flex; width: 50%;margin-top:12%;" v-if="role=='user'">
                    <p style="display: flex; width: 40%; align-items: center; margin-bottom:0;padding-left:0">Rating:</p>
                    <select class="form-select" v-model="book.user_rating" style="width: 20%; margin-right: 2%;">
                        <option value=0 >--</option>
                        <option v-for="rating in 5" :key="rating" :value="rating">{{rating}}</option>
                    </select>
                    <button class="btn btn-default" style="width:25%;border-color: #015668" 
                            :disabled="book.user_rating == 0" @click='submitRating'>Submit</button>
                </div>
                </br>
                <div style="height:11%" v-if="role=='admin'"></div>
                <div class="row mb-3" style="display: flex; width: 80%;align-items:center">
                    <p style="width: 25%;padding-left:0">Issue Status: </p>
                    <div style="width: 75%;" v-if="book.issued_to==null && book.requested_by==null">
                        <p>Available for issue</p>
                    </div>
                    <div style="width: 75%;" v-else-if="book.issued_to==null && book.requested_by.id != userid">
                        <p v-if="role=='user'">Requested by others</p>
                        <p v-else>Requested by {{book.requested_by.name}}</p>
                    </div>
                    <div style="width: 75%;" v-else-if="book.issued_to==null && book.requested_by.id == userid">
                        <p v-if="role=='user'">Requested by self</p>
                        <p v-else>Requested by {{book.requested_by.name}}</p>
                    </div>
                    <div style="width: 75%;" v-else-if="book.issued_to.id != userid">
                        <p v-if="role=='user'">Issued to others</p>
                        <p v-else>Issued to {{book.issued_to.name}}</p>
                    </div>
                    <div style="width: 75%;" v-else-if="book.issued_to.id == userid">
                        <p v-if="role=='user'">Issued to self <b v-if="this.isExpired()==true" style="color:red;">(Expired)</b></p>
                        <p v-else>Issued to {{book.issued_to.name}}</p>
                    </div>
                </div>
                
                <div class="row mb-3" style="width: 75%;">
                    <div v-if="book.issued_to==null && book.requested_by==null" style="padding-left:0"> 
                        <button class="btn btn-success" style="background-color: #015668;width:50%;" v-if="role=='user'"
                                @click='requestBook'>Request e-book</button>
                        <button class="btn btn-success" style="background-color: #015668;width:50%" v-else
                                @click='issueBook'>Issue e-book</button>
                    </div>
                    <button class="btn btn-outline-danger" v-if="book.requested_by!=null && book.requested_by.id==userid && role=='user'"
                            style="width:50%" @click='cancelRequest'>Cancel Request</button>

                    <div v-if="book.requested_by!=null && role=='admin'" style="display:flex;padding-left:0"> 
                        <button class="btn btn-success" style="background-color: #015668; width:35%;margin-right:5%"
                                @click='approveRequest'>Approve request</button>
                        <button class="btn btn-outline-danger" style="width:35%"
                                @click='rejectRequest'>Reject request</button>
                    </div>

                    <div v-if="book.issued_to != null && book.issued_to.id==userid && role=='user'" style="display:flex;padding-left:0"> 
                        <button class="btn btn-success" style="background-color: #015668; width:35%;margin-right:5%"
                                @click='readBook(book.content)' :disabled="isExpired()">Read e-book</button>
                        <button class="btn btn-outline-danger" style="width:35%"
                                @click='returnBook' :disabled="isExpired()">Return e-book</button>
                    </div>
                    <button class="btn btn-outline-danger" v-if="book.issued_to!=null && role=='admin'"
                            style="width:50%" @click='revokeBook'>Revoke e-book</button>

                    <div style="display:flex;padding-left:0;margin-top:10%"> 
                        <button class="btn btn-success" style="background-color: #015668; width:50%;margin-right:5%"
                                v-if="book.user_purchased==false && role=='user'" @click='purchaseBook'>Purchase e-book</button>
                        <button class="btn btn-success" style="background-color: #015668; width:50%;margin-right:5%"
                                v-else-if="book.user_purchased==true || role=='admin'" @click='downloadBook'>Download e-book</button>
                    </div>

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
                sections: [],
                price: null,
                content: null,
                issued_to: null,
                requested_by: null,
                user_rating: 0,
                user_purchased: false,
                user_request_status: null
            },
            id: this.$route.query.id,
            token: JSON.parse(localStorage.getItem('user')).token,
            role: JSON.parse(localStorage.getItem('user')).role,
            userid: JSON.parse(localStorage.getItem('user')).id,
            allSections: [],
            error: null,
            allSelected: false
        }
    },
    components: {
        Navbar,
    },
    mounted() {
        this.loadSections();
        this.loadBookData();
        if (this.role == 'user')
            this.loadUserBookData();
    },
    methods: {
        formatDate(value) {
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const hours = date.getHours() % 12 || 12;
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
            },
        isExpired(){
            return this.formatDate(this.book.issued_to.expiry) < this.formatDate(new Date());
        },
        toggleAll(checked) {
            this.book.sections = checked ? Object.values(this.allSections).map(section => section.id) : []
        },
        clearMessage() {
            this.error = null
        },
        goBack() {
            this.$router.back()
        },
        readContent(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.type != "text/plain") {
                    this.book.content = null
                    this.error = 'Unsupported file type'
                }
                else {
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
        async updateBook() {
            const book_details={
                id: this.id,
                name: this.book.name,
                author: this.book.author,
                sections: this.book.sections,
                price: this.book.price,
                content: this.book.content,
            }
            const res = await fetch('/book/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify(book_details),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)
            }
            else{
                this.error = data.message
            }
        },
        async loadSections() {
            const res = await fetch('/section/all', {
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
        async loadBookData() {
            const res = await fetch(`/book/${this.id}`, {
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
                this.book.sections = Object.values(data.sections).map(section => section.id)
                this.book.price = data.price
                this.book.content = data.content
                this.book.issued_to = data.issued_to
                this.book.requested_by = data.requested_by
            }
        },
        async loadUserBookData() {
            const res = await fetch(`/userbook/${this.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
            })
            if (res.ok) {
                const data = await res.json()
                this.book.user_rating = data.user_rating
                this.book.user_purchased = data.user_purchased
                this.book.user_request_status = data.user_request_status
            }
        },
        async submitRating() {
            const res = await fetch('/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify({
                    'action' : 'RATE',
                    'book_id' : this.id,
                    'rating' :  this.book.user_rating
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
        },
        async requestBook() {
            const res = await fetch('/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify({
                    'action' : 'REQUEST',
                    'book_id' : this.id
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
        },
        async cancelRequest(){
            var result = confirm("Are you sure you want to cancel your request?");
            if (result){
                const res = await fetch('/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'CANCEL',
                        'book_id' : this.id
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
        async returnBook(){
            var result = confirm("Are you sure you want to return this book?");
            if (result){
                const res = await fetch('/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'RETURN',
                        'book_id' : this.id
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
        
        async approveRequest(){
            const res = await fetch('/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify({
                    'action' : 'APPROVE',
                    'book_id' : this.id
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
        },
        async rejectRequest(){
            var result = confirm("Are you sure you want to reject this request?");
            if (result){
                const res = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'REJECT',
                        'book_id' : this.id
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
        async issueBook(){
            this.$router.push({ name: 'IssueBooks', params : { selected_books:[this.id] } })
        },
        async revokeBook(){
            var result = confirm("Are you sure you want to revoke this book?");
            if (result){
                const res = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'REVOKE',
                        'book_id' : this.id
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
        readBook(content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const newTab = window.open();
            newTab.document.body.innerHTML = '<pre>' + content + '</pre>';
            URL.revokeObjectURL(url);
        },
        async purchaseBook(){
            var result = confirm(`Are you sure you want to pay Rs.${this.book.price}/- and purchase this book?`);
            if (result){
                const res = await fetch('/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'PURCHASE',
                        'book_id' : this.id
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
        downloadBook(){
            const contentBytes = new TextEncoder().encode(this.book.content);
            const blob = new Blob([contentBytes], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.book.name+'.txt'); // Set the filename
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        },
    },
    watch: {
        'book.sections': {
            handler(newValue) {
                // Handle changes in individual section checkboxes
                if (newValue.length === 0) {
                    this.allSelected = false
                } else if (newValue.length === this.allSections.length) {
                    this.allSelected = true
                } else {
                    this.allSelected = false
                }
            }
        },
        allSections(newValue) {
           if (this.book.sections.length === 0) {
                this.allSelected = false
            } else if (this.book.sections.length === newValue.length) {
                this.allSelected = true
            } else {
                this.allSelected = false
            }
        }
      }
}