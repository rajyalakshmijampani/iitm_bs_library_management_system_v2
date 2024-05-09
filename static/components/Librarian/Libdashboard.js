import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
        <div> Welcome librarian</div>
    </Navbar>
    `,
    components:{
        Navbar,
    },
    data() {
        return {
            error: null,
            success: null
        }
    },
}