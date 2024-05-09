import Login from './components/Common/Login.js'
// import Register from './components/User/Register.js'
import Libdashboard from './components/Librarian/Libdashboard.js'
import Userdashboard from './components/User/Userdashboard.js'
import Books  from './components/Common/Books.js'

const routes = [
    { path: '/', component: Login, name: 'Login' },
    // {path:'/register',component : Register},
    { path: '/libdashboard', component: Libdashboard },
    { path: '/userdashboard', component: Userdashboard },
    { path: '/books', component: Books }
]

export default new VueRouter({
    routes,
})