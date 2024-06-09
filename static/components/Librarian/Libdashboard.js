import Navbar from "/static/components/Common/Navbar.js"
import Book from "/static/components/Book/Book.js"

export default {
    template: `
    <Navbar>
        <div class="col">
            <div class="row" style="margin : 2vh 0 2vh 0; width:30%; height: 5vh;align-items: center;">
                <div style="padding-left: 0;color:red;" v-if="error">
                    {{ error }}
                    <button class="btn-close" style="float: inline-end;" @click="clearMessage"></button>
                </div>
            </div>
            <div class="row mb-3" style="display:flex;justify-content:center;height:75vh;">
                <b-card nobody style="border:1px solid #015668">    
                    <b-tabs pills card fill>
                        <b-tab title="Graphical Summary" active>
                            
                        </b-tab>
                        <b-tab title="Approve/Reject Requests">
            
                        </b-tab>
                        
                        <b-tab title="Revoke expired books">
                        <p>Hi</p>  
                        </b-tab>
                        <b-tab title="All Users">
                            <div class="overflow-auto">
                                <b-table :items="userList" :per-page="perPage" :current-page="currentPage" style="width:85%;margin-top:3%;margin-left:7%;text-align:center"></b-table>
                                <p style="margin-top:5%;margin-left:42%">Showing 5 results per page</p>
                                <b-pagination v-model="currentPage" :total-rows="userList.length" :per-page="perPage" style="justify-content:center"></b-pagination>
                            </div>
                        </b-tab>                                                
                    </b-tabs>
                </b-card>
            </div>
        </div>
    </Navbar>
    `,
    components:{
        Navbar,
        Book
    },
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            userList: [],
            perPage: 5,
            currentPage: 1
        }
    },
    created(){
        this.loadUsers()
    },
    methods: {
        async loadUsers(){
            const users = await this.fetchUsers();
            // Array of promises to fetch book counts
            const userPromises = users.map(async (user) => {
            const userbooks = await this.fetchUserBooks(user.id);
            return {
                id: `${user.id}`,
                name: `${user.name}`,
                email: `${user.email}`,
                issues_count: `${userbooks.issues_count}`,
                requests_count: `${userbooks.requests_count}`
            };
            });
        
            this.userList = await Promise.all(userPromises);
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
            return {'issues_count':books.issues.length,'requests_count':books.requests.length};
        },
    }
}