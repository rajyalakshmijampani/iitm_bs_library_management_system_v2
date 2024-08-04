ClickReads is a dynamic multi-user web application for managing the activities of an e-library. It has two roles - a librarian/admin to maintain sections/e-Books, and general user to access the e-books.


The application also has backend jobs for sending daily reminders to users and monthly activity report to admin. Admin can also trigger asynchronous jobs to download book report and issues report from UI. Frequently accessed pages like Book Management, Section Management are cached to increase the performance.


•	HTML, CSS, Bootstrap and VueJS for UI and styling
•	Flask framework of Python for backend
•	SQLite database – integrated using Flask-SQLAlchemy and Flask-RESTful
•	Jinja2 for email templates
•	Redis for caching
•	Redis and Celery for batch jobs
