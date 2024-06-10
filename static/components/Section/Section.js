import Book from "../Book/Book.js";

export default {
    template: `
    <div>
          <div class="section-header" style="background-color: #f0f0f0;  color: #333; padding: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; border-radius: 5px;margin-right: 10px;width:95%"
                @click="toggleSection">
            <div style="width:25%">
              <i :class="['fas', isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up', 'arrow']" style="margin-right:1%"></i>
                {{ section.name }}  ({{section.books.length}})
            </div>
            <div style="width:20%;" v-if="role=='admin'">
              <router-link :to="{ name: 'EditSection', params: { section: section }}" tag="button"
                          style="background-color: white; color: #015668; border-radius: 8px;  padding: 6px 10px; border: 1px solid #015668; margin-right:2%; vertical-align: top;">
                  <i class="fa-regular fa-pen-to-square" style="color: #015668"></i> Edit
              </router-link>
              <b-button class="btn-outline-danger" style="background-color:white; color:crimson;" 
                    @click='confirmDelete(section.id,section.name)'>
                  <i class="fa-regular fa-trash-can"></i> Delete
              </b-button>
            </div>
          </div>
          <div v-show="!isCollapsed" class="section-content">
            <b-container>
              <b-row style="margin-top:3%">
                  <b-col v-for="(book,index) in paginatedBooks" :key="index" cols="3" class="mb-3">
                      <Book :book="book" :page="location" :section="section"/>
                  </b-col>
                  <section style="height: 250px; border: 2px dashed #ccc; background-color: #f9f9f9; width: 20%; cursor: pointer;" 
                            @click="tagBooks()" v-if="role=='admin' && isLastPage">
                      <div style="width:100%; text-align: center; margin-top: 40%"><i class="fas fa-plus"></i></div>
                      <div style="width:100%; text-align:center">Tag more books</div>
                  </section>
                  <p style="margin-top:2%;margin-left:42%">Showing 4 results per page</p>
                  <b-pagination  v-model="currentPage" :total-rows="totalBooks" :per-page="booksPerPage" style="justify-content:center"/>
              </b-row>
            </b-container>
          </div>
        </div>
    `,
    props: ['section'],
    components: {
      Book
    },
    data() {
      return {
        token: JSON.parse(localStorage.getItem('user')).token,
        role: JSON.parse(localStorage.getItem('user')).role,
        isCollapsed: true,
        no_of_books: 0,
        error: null,
        location: 'section_page',
        currentPage: 1,
        booksPerPage: 4,
      }
    },
    computed: {
      totalBooks() {
        return this.section.books.length+1; //+1 for Tag books section
      },
      paginatedBooks() {
        const start = (this.currentPage - 1) * this.booksPerPage;
        const end = start + this.booksPerPage;
        return this.section.books.slice(start, end);
      },
      isLastPage() {
        return this.currentPage === Math.ceil(this.totalBooks / this.booksPerPage);
      }
    },
    methods: {
        tagBooks(){
          this.$router.push({ name: 'TagBooks', params: { section: this.section }})
        },
        async toggleSection() {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.isCollapsed = !this.isCollapsed;
            console.log('Toggled section:', this.title); // Accessing the prop here
        },
        confirmDelete(section_id,section_name){
            var result = confirm("Are you sure you want to delete the section '" + section_name + "' ?. This will untag its books if any.");
            if (result)
                this.deleteSection(section_id)
        },
        async deleteSection(id){
            const res = await fetch(`/section/delete/${id}`, {
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