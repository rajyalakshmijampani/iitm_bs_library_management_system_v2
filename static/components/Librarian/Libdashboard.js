import Navbar from "/static/components/Common/Navbar.js"

export default {
    template: `
    <Navbar>
        <div class="col" style="width: 85%;">
            <div class="row mb-3" style="margin-top:5%;height:75vh;">
                <b-card nobody style="border:1px solid #015668">    
                    <b-tabs pills card fill>
                        <b-tab title="Graphical Summary" active>
                            <div style="display: flex; flex-direction: row;justify-content: center;align-items: center;">
                                <div style="width: 45%;height:400px;margin-right:2%">
                                    <canvas id="sectionSummaryChart" style="display: block; width: 100% !important;height: 100% !important;"></canvas> 
                                </div>
                                
                                <div style="width: 45%;height:400px">
                                    <canvas id="issueTrendChart" style="display: block; height: 100% !important;"></canvas> 
                                </div>
                            </div>                          
                        </b-tab>

                        <b-tab title="Approve/Reject Requests">
                            <div class="overflow-auto">
                                <b-table :items="requestedBooks" :fields= "['selected', 'Book ID', 'Name', 'Author', 'Requested By']" :per-page="perPage" :current-page="currentPage" 
                                        select-mode="multi" responsive="sm" ref="RequestsTable" selectable  @row-selected="onRowSelectedRequests" 
                                        style="width:85%;margin-top:2%;margin-left:7%;text-align:center;">
                                    <template #cell(selected)="{ rowSelected }">
                                        <template v-if="rowSelected">
                                            <span aria-hidden="true">&check;</span>
                                            <span class="sr-only">Selected</span>
                                        </template>
                                        <template v-else>
                                            <span aria-hidden="true">&nbsp;</span>
                                            <span class="sr-only">Not selected</span>
                                        </template>
                                    </template>
                                </b-table>
                                <p style="margin-left:7%;">
                                    <b-button @click="selectAllRows($refs.RequestsTable)">Select all</b-button>
                                    <b-button @click="clearSelected($refs.RequestsTable)">Clear selected</b-button>
                                    <button class="btn btn-success" style="background-color: #015668;" :disabled="requestsSelected.length==0" 
                                            @click="approve">Approve Requests</button>
                                    <button class="btn btn-danger" :disabled="requestsSelected.length==0"
                                            @click="reject">Reject Requests</button>
                                </p>                                
                                <p style="margin-top:3%;margin-left:42%">Showing 5 results per page</p>
                                <b-pagination v-model="currentPage" :total-rows="requestedBooks.length" :per-page="perPage" style="justify-content:center"></b-pagination>
                            </div>
                        </b-tab>


                        <b-tab title="Revoke expired books">
                            <div class="overflow-auto">
                                <b-table :items="expiredBooks" :fields= "['selected', 'Book ID', 'Name', 'Author', 'Issued to','Expired On']" :per-page="perPage" :current-page="currentPage" 
                                        select-mode="multi" responsive="sm" ref="selectableTable" selectable  @row-selected="onRowSelectedExpiredBooks" 
                                        style="width:85%;margin-top:2%;margin-left:7%;text-align:center;">
                                    <template #cell(selected)="{ rowSelected }">
                                        <template v-if="rowSelected">
                                            <span aria-hidden="true">&check;</span>
                                            <span class="sr-only">Selected</span>
                                        </template>
                                        <template v-else>
                                            <span aria-hidden="true">&nbsp;</span>
                                            <span class="sr-only">Not selected</span>
                                        </template>
                                    </template>
                                </b-table>
                                <p style="margin-left:7%;">
                                    <b-button @click="selectAllRows($refs.selectableTable)">Select all</b-button>
                                    <b-button @click="clearSelected($refs.selectableTable)">Clear selected</b-button>
                                    <button class="btn btn-danger" :disabled="expiredBooksSelected.length==0" @click="revokeBooks">Revoke Books</button>
                                </p>                                
                                <p style="margin-top:3%;margin-left:42%">Showing 5 results per page</p>
                                <b-pagination v-model="currentPage" :total-rows="expiredBooks.length" :per-page="perPage" style="justify-content:center"></b-pagination>
                            </div>
                        </b-tab>
                        <b-tab title="All Users">
                            <div class="overflow-auto">
                                <b-table :items="userList" :per-page="perPage" :current-page="currentPage" style="width:85%;margin-top:3%;margin-left:7%;text-align:center"></b-table>
                                <p style="margin-top:5%;margin-left:42%">Showing 5 results per page</p>
                                <b-pagination v-model="currentPage" :total-rows="userList.length" :per-page="perPage" style="justify-content:center"></b-pagination>
                            </div>
                        </b-tab>
                        <b-tab title="Reports">
                            <button class="btn btn-success" style="background-color: #015668; width:30%;margin-top:5%;margin-left:35%" 
                                            :disabled="bookReportPending" @click='downloadBookReport'>
                                            <span v-if="bookReportPending">Report generation in progress..</span>
                                            <span v-else>Download Book Report</span>
                            </button>
                            <br>
                            <button class="btn btn-success" style="background-color: #015668; width:30%;margin-top:5%;margin-left:35%"
                                            :disabled="issuesReportPending" @click='downloadIssuesReport'>
                                            <span v-if="issuesReportPending">Report generation in progress..</span>
                                            <span v-else>Download Issues Report</span>
                            </button>
                        </b-tab>                                                 
                    </b-tabs>
                </b-card>
            </div>
        </div>
    </Navbar>
    `,
    components:{
        Navbar
    },
    data() {
        return {
            token: JSON.parse(localStorage.getItem('user')).token,
            requestedBooks:[],
            expiredBooks:[],
            userList: [],
            requestsSelected: [],
            expiredBooksSelected: [],
            perPage: 5,
            currentPage: 1,
            section_labels:[],
            section_books: [],
            issue_dates:[],
            issue_counts:[],
            bookReportPending: false,
            issuesReportPending: false
        }
    },
    mounted(){
        this.loadSectionSummary()
        this.loadIssueSummary()
        this.loadRequestedBooks()
        this.loadExpiredBooks()
        this.loadUsers()
    },
    methods: {
        onRowSelectedExpiredBooks(items){
            this.expiredBooksSelected = items.map(item=>item["Book ID"])
        },
        onRowSelectedRequests(items){
            this.requestsSelected = items.map(item=>item["Book ID"])
        },
        selectAllRows(table) {
            table.selectAllRows()
        },
        clearSelected(table) {
            table.clearSelected()
        },
        async loadSectionSummary(){
            const res = await fetch('/section/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                const allSections = data.map(section => {
                                        return {"name":section.name,"bookcount":section.books.length}
                                        })
                this.section_labels = allSections.map(section => section.name);
                this.section_books = allSections.map(section => section.bookcount);
            }
            this.drawSectionSummaryChart();
        },
        drawSectionSummaryChart(){
            const generateRandomColor = () => {
                let r, g, b;
                let isWhite = true;
                let isRepeated = true;
                // Generate a color until it's not too close to white
                do {
                  r = Math.floor(Math.random() * 256);
                  g = Math.floor(Math.random() * 256);
                  b = Math.floor(Math.random() * 256);
                  isWhite = (r > 200 && g > 200 && b > 200);
                  isRepeated = (r==g || g==b || r==b)
                } while (isWhite || isRepeated);

                const toHex = x => x.toString(16).padStart(2, '0')
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`;

              };
             
            const generateRandomColors = (numColors) => {
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                colors.push(generateRandomColor());
            }
            return colors;
            };

            const backgroundColors = generateRandomColors(this.section_labels.length)

            const canvas = document.getElementById('sectionSummaryChart');
            const ctx = canvas.getContext('2d');

            if (this.section_books.length === 0 || this.section_books.every(value => value == 0)) {
                ctx.save();
                ctx.font = '15px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillText('No data for section-wise books',canvas.width/2,canvas.height/2);
                ctx.restore();
            }
            else{
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                labels: this.section_labels,
                datasets: [{
                    data: this.section_books,
                    backgroundColor: backgroundColors
                }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                font: {
                                    size: 16
                                },
                                color: 'black'
                            }
                            
                        },
                        title: {
                            display: true,
                            text: 'Section-wise book distribution',
                            font: {
                                size: 20
                            },
                            color: 'black',
                            padding: 30
                        }
                    }                
                },
                
            })};
        },
        async loadIssueSummary(){
            const res = await fetch('/issuetrend', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok){
                const issue_trend=await res.json()
                this.issue_dates = issue_trend.map(issue => new Date(issue.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
                this.issue_counts = issue_trend.map(issue => issue.count)
                this.drawIssueTrendChart()
            }
        },
        drawIssueTrendChart(){
            const ctx = document.getElementById('issueTrendChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.issue_dates,
                    datasets: [{
                        label: 'Issue Counts',
                        data: this.issue_counts,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192,0.2)'
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date',
                                color: 'black'
                            },
                            ticks: {
                                maxTicksLimit: 15,
                                color: 'black'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Count',
                                color: 'black'
                            },
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: 'black'
                              }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: '30-days issue trend',
                            font: {
                                size: 20
                            },
                            color: 'black',
                            padding: 30
                        }
                    }
                }
            });
        },
        async loadRequestedBooks(){
            const res = await fetch('/book/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.requestedBooks = data.filter(book => book.status=='REQUESTED')
                                        .map(book => {
                                            return {"Book ID": book.id,"Name": book.name,"Author":book.author,
                                                    "Requested By":book.requested_by.name}
                                        })
                }
        },
        async loadExpiredBooks(){
            const res = await fetch('/book/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                })
            if (res.ok) {
                const data = await res.json()
                this.expiredBooks = data.filter(book => book.status=='ISSUED')
                                        .filter(book=> (new Date(book.issued_to.expiry) < new Date()))
                                        .map(book => {
                                            return {"Book ID": book.id,"Name": book.name,"Author":book.author,
                                                    "Issued to":book.issued_to.name,"Expired On":this.formatDate(book.issued_to.expiry)}
                                        })
                }
        },

        async loadUsers(){
            const users = await this.fetchUsers();
            // Array of promises to fetch book counts
            const userPromises = users.map(async (user) => {
            const userbooks = await this.fetchUserBooks(user.id);
            return {
                id: `${user.id}`,
                name: `${user.name}`,
                email: `${user.email}`,
                issues_count: `${userbooks.issues_count}`,
                requests_count: `${userbooks.requests_count}`
            };
            });
        
            this.userList = await Promise.all(userPromises);
        },
        async fetchUsers(){
            const response = await fetch('/user/all', {
                headers: {
                    "Authentication-Token": this.token
                    }
                });
            const users = await response.json();
            return users;
        },
        async fetchUserBooks(userId) {
            const response = await fetch(`/user/${userId}/currentbooks`, {
                headers: {
                    "Authentication-Token": this.token
                    }
                });
            const books = await response.json();
            return {'issues_count':books.issues.length,'requests_count':books.requests.length};
        },
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
        async revokeBooks(){
            var result = confirm("Are you sure you want to revoke the selected book(s)?");
            if (result){
                const res = await fetch('/admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': this.token
                        },
                        body: JSON.stringify({
                            'action' : 'REVOKE_MANY',
                            'book_ids' : this.expiredBooksSelected
                        })
        
                    })
                    const data = await res.json()
                    if (res.ok) {
                        alert(data.message)
                        this.$router.go(0)
                    }
                    else {
                        alert(data.message)
                    }
             }
        },
        async approve(){
            const res = await fetch('/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                },
                body: JSON.stringify({
                    'action' : 'APPROVE_MANY',
                    'book_ids' : this.requestsSelected
                })
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)
            }
            else {
                this.error = data.message
            }
        },
        async reject(){
            var result = confirm("Are you sure you want to reject the selected request(s)?");
            if (result){
                const res = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify({
                        'action' : 'REJECT_MANY',
                        'book_ids' : this.requestsSelected
                    })
                })
                const data = await res.json()
                if (res.ok) {
                    alert(data.message)
                    this.$router.go(0)
                }
                else {
                    this.error = data.message
                }
            }
        },
        async downloadBookReport() {
            this.bookReportPending = true
            const res = await fetch('/download-books-csv')
            await new Promise(resolve => setTimeout(resolve, 3000));
            const data = await res.json()
            if (res.ok) {
              const taskId = data['Task-ID']
              const intv = setInterval(async () => {
                const csv_res = await fetch(`/get-csv/${taskId}`)
                if (csv_res.ok) {
                  this.bookReportPending = false
                  clearInterval(intv)
                  alert('Book Report is ready..!!')
                  window.location.href = `/get-csv/${taskId}`
                }
              }, 1000)
            }
        },
        async downloadIssuesReport() {
            this.issuesReportPending = true
            const res = await fetch('/download-issues-csv')
            await new Promise(resolve => setTimeout(resolve, 3000));
            const data = await res.json()
            if (res.ok) {
              const taskId = data['Task-ID']
              const intv = setInterval(async () => {
                const csv_res = await fetch(`/get-csv/${taskId}`)
                if (csv_res.ok) {
                  this.issuesReportPending = false
                  clearInterval(intv)
                  alert('Issues Report is ready..!!')
                  window.location.href = `/get-csv/${taskId}`
                }
              }, 1000)
            }
        }
    }
}