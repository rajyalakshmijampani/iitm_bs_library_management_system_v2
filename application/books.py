from flask_restful import Resource, Api, reqparse, marshal_with, fields
from .models import Book,db
from datetime import datetime

api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('name',type=str, help='Name of the book is required and should be a string',required=True)
parser.add_argument('file_name',type=str, help='File name of the book is required and should be a string',required=True)
parser.add_argument('author',type=str, help='Name of the author is required and should be a string',required=True)

book_output_fields={
    'id': fields.Integer,
    'name' : fields.String
}

class Book_api(Resource):
    @marshal_with(book_output_fields)
    def get(self):
        all_books = Book.query.all()
        if not all_books:
            return {"message":"No books found"},404
        return all_books
    
    def post(self):
        args = parser.parse_args()
        book_resource = Book(**args,create_date=datetime.now())
        db.session.add(book_resource)
        # Check required fields for not null
        db.session.commit()
        return {"message" : "Book created successfully"}
    

api.add_resource(Book_api, '/book')