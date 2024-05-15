import Login from './components/Common/Login.js'
import Register from '/static/components/User/Register.js'
import Libdashboard from './components/Librarian/Libdashboard.js'
import Userdashboard from './components/User/Userdashboard.js'
import Books from './components/Common/Books.js'
import AddBook from './components/Librarian/AddBook.js'
import OpenBook from './components/Common/OpenBook.js'
import Profile from './components/Common/Profile.js'

const routes = [
    { path: '/', component: Login, name: 'Login' },
    { path: '/register', component: Register , name: 'Register'},
    { path: '/libdashboard', component: Libdashboard },
    { path: '/userdashboard', component: Userdashboard },
    { path: '/profile', component: Profile },
    { path: '/books', component: Books },
    { path: '/books/add', component: AddBook },
    { path: '/books/open', component: OpenBook }
]

export default new VueRouter({
    routes,
})