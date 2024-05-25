import Book from "./Book.js";

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
              <router-link to="/books/edit" tag="button"
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
                  <b-col v-for="(book,index) in section.books" :key="index" cols="3" class="mb-3">
                      <Book :book="book"/>
                  </b-col>
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
        error: null
      }
    },
    created() {
      this.loadSectionBooks();
    },
    methods: {
        async toggleSection() {
            // Simulate an async operation
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
        async loadSectionBooks() {
          const res = await fetch(`/section/${this.section.id}`, {
              headers: {
                  "Authentication-Token": this.token
                  }
              })
          if (res.ok) {
              const data = await res.json()
              this.sectionBooks = data
              this.no_of_books = Object.keys(data).length
              }
      },
    },
  }