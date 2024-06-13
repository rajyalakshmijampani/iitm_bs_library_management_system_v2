from celery import shared_task
from .models import db,Book,Section,book_section
import flask_excel as excel
from sqlalchemy import func

@shared_task(ignore_result=False)
def create_books_csv():
    books = Book.query.with_entities(Book.id,Book.name,Book.author,Book.price,Book.status).all()
    columns = ["id","name","author","price","status"]
    csv_output = excel.make_response_from_query_sets(books,columns,"csv")
    file_name="books.csv"
    
    with open(file_name,'wb') as f:
        f.write(csv_output.data)
    
    return file_name


@shared_task(ignore_result=False)
def create_issues_csv():
    books = Book.query.all()
    columns = ["id","name","content","author","price","status","create_date"]
    csv_output = excel.make_response_from_query_sets(books,columns,"csv")
    file_name="books.csv"
    
    with open(file_name,'wb') as f:
        f.write(csv_output.data)
    
    return file_name