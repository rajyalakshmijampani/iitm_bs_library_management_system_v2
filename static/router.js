import ChangePwd from './components/Common/ChangePwd.js'
import Login from './components/Common/Login.js'
import Profile from './components/Common/Profile.js'
import Search from './components/Common/Search.js'

import Register from '/static/components/User/Register.js'
import Userdashboard from './components/User/Userdashboard.js'
import RequestBooks from './components/User/RequestBooks.js'
import ReturnBooks from './components/User/ReturnBooks.js'

import Libdashboard from './components/Librarian/Libdashboard.js'
import IssueBooks from './components/Librarian/IssueBooks.js'
import RevokeBooks from './components/Librarian/RevokeBooks.js'

import BrowseBooks from './components/Book/BrowseBooks.js'
import AddBook from './components/Book/AddBook.js'
import OpenBook from './components/Book/OpenBook.js'

import BrowseSections from './components/Section/BrowseSections.js'
import AddSection from './components/Section/AddSection.js'
import EditSection from './components/Section/EditSection.js'
import TagBooks from './components/Section/TagBooks.js'



const routes = [
    { path: '/', component: Login, name: 'Login' },
    { path: '/profile', component: Profile },
    { path: '/changepwd', component: ChangePwd},
    { path: '/search', component: Search},
    
    { path: '/register', component: Register , name: 'Register'},
    { path: '/userdashboard', component: Userdashboard },
    { path: '/books/request', component: RequestBooks},
    { path: '/books/return', component: ReturnBooks},

    { path: '/libdashboard', component: Libdashboard },
    { path: '/issue', component: IssueBooks , name: 'IssueBooks', props:true },
    { path: '/revoke', component: RevokeBooks},
    
    { path: '/books', component: BrowseBooks },
    { path: '/books/add', component: AddBook },
    { path: '/books/open', component: OpenBook },

    { path: '/sections', component: BrowseSections },
    { path: '/sections/add', component: AddSection},
    { path: '/sections/edit', component: EditSection, name: 'EditSection', props: true},
    { path: '/sections/tag', component: TagBooks, name: 'TagBooks',  props: true}
]

export default new VueRouter({
    routes,
})