export default {
    template: `
    <div>
    <!-- Top nav bar -->
    <nav class="navbar bg-body-tertiary">
        <div class="container-fluid">
            <!-- Top left logo -->
            <a class="navbar-brand" href="/">
                <img src="http://localhost:5000/static/images/logo.png" alt="ClickReads" width="350" height="60">
            </a>
            <div style="display: flex; width: 50%;">
                <select class="form-select" id="param" name="param" style="width: 100%;">
                    <option value="bookname" selected>Book</option>
                    <option value="section">Section</option>
                    <option value="author">Author</option>
                </select>
                <input type="text" class="form-control" id="query" name="query" style="width: 400%;margin-left: 1%; margin-right: 1%;" placeholder="Get ready to read...">
                <button type="submit" class="btn btn-primary" style="background-color: #015668;border-color: #015668;">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <li class="nav-item dropdown" style="list-style-type: none;">
                    <a class="nav-link dropdown-toggle" href="/" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
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
                    <router-link :to="{ path: '/purchases'}">My Purchases</router-link>
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
                    <router-link :to="{ path: '/books', query: { do: 'issue' } }">Issue Books</router-link>
                    <br/><br/>
                    <router-link :to="{ path: '/books', query: { do: 'revoke' } }">Revoke Books</router-link>
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
            message_type: null
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
        }
    }
}