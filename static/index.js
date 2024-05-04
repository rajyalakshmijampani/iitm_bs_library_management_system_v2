import router from "./router.js"
import Navbar from "./components/Navbar.js"

new Vue({
    el: "#app",
    template: `<div>
    <Navbar/>
    <router-view/>
    </div>`,
    router,
    components: {
        Navbar,     //registering local component
    },
})