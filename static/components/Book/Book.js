export default {
    template: `
    <b-card style="width:85%;border:1px solid #015668">
        <router-link :to="{ path: '/books/open', query: { id: book.id } }">
            <b-card-img src="http://localhost:5000/static/images/image.png" alt="Image" 
                        img-top style="width:75%;margin-left:12%"></b-card-img>
        </router-link></br>
        <p class="card-text text-truncate" style="margin-top:2vh"><b>{{book.name}}</b></p>
        <div style="display: flex;justify-content: space-between;align-items:center;">
            <p v-if="book.average_rating !== null" style="margin-bottom:0;"> Avg. Rating: {{ book.average_rating }}</p>

            <p v-else style="margin-bottom:0;">No ratings yet</p>

            <b-button class="btn-outline-danger" style="background-color:white; color:crimson;" 
                v-if="role=='admin'" @click='confirmDelete(book.id,book.name)'>
                <i class="fa-regular fa-trash-can"></i> Delete
            </b-button>
        </div>
        <span class="position-absolute top-0 start-100 translate-middle badge" v-if="page=='section_page' && role=='admin'">
            <button class="btn btn-danger btn-sm" style="border-radius: 50%; height: 5%"><i class="fa-solid fa-minus"></i></button>
        </span>
    </b-card>
    `,
    props: ['book','page'],
    data() {
      return {
        token: JSON.parse(localStorage.getItem('user')).token,
        role: JSON.parse(localStorage.getItem('user')).role
      }
    },
    methods: {
        confirmDelete(book_id,book_name){
            var result = confirm("Are you sure you want to delete the book '" + book_name + "' ?");
            if (result)
                this.deleteBook(book_id)
        },
        async deleteBook(id){
            const res = await fetch(`/book/delete/${id}`, {
                headers: {
                  'Authentication-Token': this.token,
                },
              })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)  // Refresh page
            }
        },
    },
  }