import Login from './components/Common/Login.js'
import Register from '/static/components/User/Register.js'
import Libdashboard from './components/Librarian/Libdashboard.js'
import Userdashboard from './components/User/Userdashboard.js'
import BrowseBooks from './components/Book/BrowseBooks.js'
import AddBook from './components/Book/AddBook.js'
import OpenBook from './components/Book/OpenBook.js'
import AddSection from './components/Section/AddSection.js'
import Profile from './components/Common/Profile.js'
import ChangePwd from './components/Common/ChangePwd.js'
import BrowseSections from './components/Section/BrowseSections.js'

const routes = [
    { path: '/', component: Login, name: 'Login' },
    { path: '/register', component: Register , name: 'Register'},
    { path: '/libdashboard', component: Libdashboard },
    { path: '/userdashboard', component: Userdashboard },
    { path: '/profile', component: Profile },
    { path: '/books', component: BrowseBooks },
    { path: '/books/add', component: AddBook },
    { path: '/books/open', component: OpenBook },
    { path: '/sections', component: BrowseSections },
    { path: '/sections/add', component: AddSection},
    { path: '/changepwd', component: ChangePwd}
]

export default new VueRouter({
    routes,
})