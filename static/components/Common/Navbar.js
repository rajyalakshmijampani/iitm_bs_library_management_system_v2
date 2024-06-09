export default {
    template: `
    <div>
    <!-- Top nav bar -->
    <nav class="navbar bg-body-tertiary">
        <div class="container-fluid">
            <!-- Top left logo -->
            <a class="navbar-brand">
                <img src="http://localhost:5000/static/images/logo.png" alt="ClickReads" width="350" height="60">
            </a>
            <li class="nav-item dropdown" style="list-style-type: none;">
                    <a class="nav-link dropdown-toggle" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                        Welcome, {{name}}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                        <li><a class="dropdown-item " @click='profile'>Edit Profile</a></li>
                        <li><a class="dropdown-item " @click='changepwd'>Change Password</a></li>
                        <li><a class="dropdown-item" @click='logout'>Logout</a></li>
                    </ul>
                </li>
        </div>
    </nav>
    <div class="row" style="height: 100%;width:100%">
            <div class="col-2" style="width: 15%; padding-right: 0px;" v-if="role=='user'">
                <div style="margin-left:5%"> 
                    <h5 style="color: #015668;margin-top: 60px;margin-bottom: 40px;">My library</h5>
                    <router-link to='/userdashboard'>Dashboard</router-link>
                    <br/><br/>
                    <router-link to="/sections">Browse Sections</router-link>
                    <br/><br/>
                    <router-link to="/books">Browse Books</router-link>
                    <br/><br/>
                    <router-link to="/books/request">Request Books</router-link>
                    <br/><br/>
                    <router-link to="/books/return">Return Books</router-link>
                    <br/><br/>
                    <router-link to="/search">Search Collection</router-link>
                    <br/><br/>
                </div>
            </div>
            <div class="col-2" style="width: 15%; padding-right: 0px;" v-if="role=='admin'">  
                <div style="margin-left:5%">  
                    <h5 style="color: #015668;margin-top: 60px;margin-bottom: 40px;">My library</h5>
                    <router-link to='/libdashboard'>Dashboard</router-link>
                    <br/><br/>
                    <router-link to="/sections">Manage Sections</router-link>
                    <br/><br/>
                    <router-link to="/books">Manage Books</router-link>
                    <br/><br/>
                    <router-link to="/issue">Issue Books</router-link>
                    <br/><br/>
                    <router-link to="/revoke">Revoke Books</router-link>
                    <br/><br/>
                    <router-link to="/search">Search Collection</router-link>
                    <br/><br/>

                </div>
            </div>
            <slot></slot>
    </div>  
    </div>              
    `,
    data() {
        return {
            role: JSON.parse(localStorage.getItem('user')).role,
            name: JSON.parse(localStorage.getItem('user')).name,
            message: null,
            message_type: null,
        }
    },
    methods: {
        profile() {
            this.$router.push("/profile")
        },
        changepwd() {
            this.$router.push("/changepwd")
        },
        logout() {
            localStorage.clear()
            this.$router.push("/")
        },
        async loadBooks() {
            const res = await fetch('/book/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                const allBooks = data
                const no_of_books = Object.keys(data).length
                }
        },
    }
}