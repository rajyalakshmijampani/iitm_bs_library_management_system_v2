import Login from './components/Common/Login.js'
import Register from '/static/components/User/Register.js'
import Libdashboard from './components/Librarian/Libdashboard.js'
import Userdashboard from './components/User/Userdashboard.js'
import Books from './components/Common/Books.js'
import AddBook from './components/Librarian/AddBook.js'

const routes = [
    { path: '/', component: Login, name: 'Login' },
    { path: '/register', component: Register , name: 'Register'},
    { path: '/libdashboard', component: Libdashboard },
    { path: '/userdashboard', component: Userdashboard },
    { path: '/books', component: Books },
    { path: '/books/add', component: AddBook },
]

export default new VueRouter({
    routes,
})