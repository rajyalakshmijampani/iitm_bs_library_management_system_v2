from celery import shared_task
from .models import db,Issue,User,Role,Book
import flask_excel as excel
from sqlalchemy import text,distinct
from .mail_service import send_message
from jinja2 import Template

@shared_task(ignore_result=False)
def create_books_csv():
    books_query = text("SELECT b.id, b.name,b.author,COALESCE(GROUP_CONCAT(s.name, ';'), NULL) AS sections,b.price,b.status " \
                    "FROM book b " \
                    "LEFT JOIN book_section bs ON b.id = bs.book_id " \
                    "LEFT JOIN section s ON s.id = bs.section_id " \
                    "GROUP BY b.id")
    books = db.session.execute(books_query).all()
    columns = ["id","name","author","sections","price","status"]
    csv_output = excel.make_response_from_query_sets(books,columns,"csv")
    file_name="books.csv"
    
    with open(file_name,'wb') as f:
        f.write(csv_output.data)
    
    return file_name


@shared_task(ignore_result=False)
def create_issues_csv():
    issues_query = text("SELECT i.id as issue_id, b.name as book_name,u.name as user_name,strftime('%Y-%m-%d %H:%M', i.issue_date) as issue_date,strftime('%Y-%m-%d %H:%M', i.return_date) as 'actual/expected_return_date', "\
                        "CASE "\
                        "WHEN i.is_active = 1 THEN 'True' "\
                        "ELSE 'False' "\
                        "END AS is_active "\
                        "FROM issue i "\
                        "JOIN book  b ON i.book_id = b.id "\
                        "JOIN user u ON i.user_id = u.id")
    issues = db.session.execute(issues_query).all()
    columns = ["issue_id","book_name","user_name","issue_date","actual/expected_return_date","is_active"]
    csv_output = excel.make_response_from_query_sets(issues,columns,"csv")
    file_name="issues.csv"
    
    with open(file_name,'wb') as f:
        f.write(csv_output.data)
    
    return file_name

@shared_task(ignore_result=True)  #user.roles.any(Role.name='admin')
def user_reminder(subject):
    users_tuples = db.session.query(distinct(Issue.user_id)).filter_by(is_active=True).all()
    for user_tuple in users_tuples:
        user_id = user_tuple[0]
        user = db.session.query(User).filter_by(id=user_id).one_or_none()
        user_issues_query = text("select b.name as book_name,b.author,strftime('%Y-%m-%d %H:%M', i.issue_date) as issue_date,strftime('%Y-%m-%d %H:%M', i.return_date) as return_date "\
                                "from issue i,book b where i.user_id ="+str(user.id)+" and i.is_active=1 and i.book_id=b.id")
        user_issues = db.session.execute(user_issues_query).all()
        if user_issues:
            with open('templates/user_reminder.html', 'r') as f:
                template = Template(f.read())
                send_message(user.email, subject, template.render(issues=user_issues))
    return "OK"

@shared_task(ignore_result=True)
def admin_report(subject):
    admin_role = Role.query.filter_by(name='admin').first()
    admin = User.query.filter(User.roles.contains(admin_role)).first()
    latest_books_query = text("SELECT b.id, b.name,b.author,COALESCE(GROUP_CONCAT(s.name, ';'), NULL) AS sections,b.price,avg(r.rating) as avg_rating,"\
                              "b.status,strftime('%Y-%m-%d %H:%M', b.create_date) as create_date "\
                            "FROM book b "\
                            "LEFT JOIN rating r ON b.id = r.book_id "\
                            "LEFT JOIN book_section bs ON b.id = bs.book_id "\
                            "LEFT JOIN section s ON s.id = bs.section_id "\
                            "WHERE b.create_date >= DATE('now', '-30 days') "\
                            "GROUP BY b.id")
    latest_books = db.session.execute(latest_books_query).all()
    latest_issues_query = text("SELECT b.name as book_name,u.name as user_name,strftime('%Y-%m-%d %H:%M', i.issue_date) as issue_date,strftime('%Y-%m-%d %H:%M', i.return_date) as 'actual/expected_return_date', "\
                        "CASE "\
                        "WHEN i.is_active = 1 THEN 'True' "\
                        "ELSE 'False' "\
                        "END AS is_active "\
                        "FROM issue i "\
                        "JOIN book  b ON i.book_id = b.id "\
                        "JOIN user u ON i.user_id = u.id "\
                        "WHERE issue_date >= DATE('now', '-30 days') OR return_date >= DATE('now', '-30 days')")
    latest_issues = db.session.execute(latest_issues_query).all()
    with open('templates/admin_report.html', 'r') as f:
            template = Template(f.read())
            send_message(admin.email, subject, template.render(latest_books = latest_books, latest_issues=latest_issues))
    return "OK"