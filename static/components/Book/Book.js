export default {
    template: `
    <b-card style="width:85%;border:1px solid #015668">
        <router-link :to="{ path: '/books/open', query: { id: book.id } }">
            <b-card-img src="http://localhost:5000/static/images/image.png" alt="Image" 
                        img-top style="width:75%;margin-left:12%"></b-card-img>
        </router-link></br>
        <p class="card-text text-truncate" style="margin-top:2vh"><b>{{book.name}}</b></p>

        <div v-if="page=='user_dashboard'" style="display: flex;justify-content: space-between;align-items:center;">

          <p v-if="this.isExpired(book.issued_to.expiry)==true" style="color:red;margin-bottom:0;"><b>Expired</b></p>
          <p v-else style="margin-bottom:0;"> Expiry: {{this.formatDate(book.issued_to.expiry)}}</p>

        </div>

        <div v-else-if="page=='search_results' || page=='section_page'" style="display: flex;justify-content: space-between;align-items:center;">
          <p style="margin-bottom:0"> By {{book.author}}</p>
        </div>

        <div v-else style="display: flex;justify-content: space-between;align-items:center;">
            <p v-if="book.average_rating !== null" style="margin-bottom:0;"> Avg. Rating: {{ book.average_rating }}</p>

            <p v-else style="margin-bottom:0;">No ratings yet</p>

            <b-button class="btn-outline-danger" style="background-color:white; color:crimson;" 
                v-if="role=='admin'" @click='confirmDelete(book.id,book.name)'>
                <i class="fa-regular fa-trash-can"></i> Delete
            </b-button>
        </div>
        <span class="position-absolute top-0 start-100 translate-middle badge" v-if="page=='section_page' && role=='admin'">
            <button class="btn btn-danger btn-sm" style="border-radius: 50%; height: 5%"
                    @click='confirmUntag(book.id,book.name,section.id,section.name)'><i class="fa-solid fa-minus"></i></button>
        </span>
    </b-card>
    `,
    props: ['book','page','section'],
    data() {
      return {
        token: JSON.parse(localStorage.getItem('user')).token,
        role: JSON.parse(localStorage.getItem('user')).role
      }
    },
    methods: {
      formatDate(value) {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const hours = date.getHours() % 12 || 12;
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
      },
      isExpired(bookdate){
        return this.formatDate(bookdate) < this.formatDate(new Date());
      },
        confirmDelete(book_id,book_name){
            var result = confirm("Are you sure you want to delete the book '" + book_name + "' ?");
            if (result)
                this.deleteBook(book_id)
        },
        confirmUntag(book_id,book_name,section_id,section_name){
            var result = confirm("Are you sure you want to untag the book '" + book_name + "' from '"+section_name+"' ?");
            if (result)
                this.untagBook(book_id,section_id)
        },
        async untagBook(book_id,section_id){
            const res = await fetch('/book/untag', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',  
                  'Authentication-Token': this.token,
                },
                body: JSON.stringify({'book_id':book_id, 'section_id':section_id})
              })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)  // Refresh page
            }
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