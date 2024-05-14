from flask import current_app as app,jsonify,request,render_template,Response
from flask_security import auth_required, roles_required
from flask_restful import marshal,fields
from .models import Request,db,Book,Section,Issue,Purchase,Rating
from .datastore import datastore
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from io import BytesIO

@app.get('/')
def home():
    return render_template("index.html")

@app.post('/user_login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get("password")
    if not email:
        return jsonify({"message":"Email is required"}),400
    if not password :
        return jsonify({"message":"Password is required"}),400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"User not found"}),404
    if check_password_hash(user.password,password):
        return jsonify({"email":user.email,"role":user.roles[0].name,
                        "token":user.get_auth_token()})
    else:
        return jsonify({"message":"Incorrect password"}),400

@app.post('/register')
def register():
    data = request.get_json()
    name=data.get('name')
    email = data.get('email')
    password = data.get("password")
    if not name:
        return jsonify({"message":"Name is required"}),400
    if not email:
        return jsonify({"message":"Email is required"}),400
    if not password :
        return jsonify({"message":"Password is required"}),400
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message":"Email already exists"}),404
    user = datastore.create_user(name=name,email=email,password=generate_password_hash(password),roles=['user'])
    db.session.commit()
    return jsonify({"message":"User registered successfully"})


#===============================BOOK API===============================#

book_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "author": fields.String,
    "price": fields.Integer,
    "section": fields.Nested({
        'id': fields.Integer,
        'name': fields.String
        }),
    "average_rating": fields.Float
    }

#---------------------CREATE------------------#

@app.post('/books/add')
@auth_required("token")
@roles_required("admin")
def create_book():
    data = request.get_json()
    name=data.get('name')
    author=data.get('author')
    section=data.get('section')
    price=data.get('price')
    content=data.get('content')
    if not name:
        return jsonify({"message":"Name is required"}),400
    if not author:
        return jsonify({"message":"Author is required"}),400
    if not content :
        return jsonify({"message":"Empty file/content"}),400
    if not price:
        return jsonify({"message":"Price is required"}),400
    else:
        try:
            price=int(price)
        except:
            return jsonify({"message":"Invalid value for price"}),400
    if section:
        section_obj=Section.query.filter_by(name=section).first()
        if not section_obj:
            return jsonify({"message":"Invalid Section"}),400
        section_id = section_obj.id
    else:
        section_id=None

    book = Book.query.filter_by(name=name).first()
    if book:
        return jsonify({"message":"Book name already exists"}),404
    book = Book(name=name,author=author,price=price,section_id=section_id,content=content,create_date=datetime.now())
    db.session.add(book)
    db.session.commit()
    marshalled_data = marshal(book, book_fields)
    return jsonify({**marshalled_data, **{"message":"Book created successfully"}})

#---------------------READ------------------#

@app.get('/books')
@auth_required("token")
def get_books():
    books = Book.query.all()
    if len(books) == 0:
        return jsonify({"message": "No books available"}), 404
    return marshal(books, book_fields)


@app.get('/books/download/<int:id>')
@auth_required("token")
@roles_required("admin")
def download_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    else:
        return jsonify({"content":book.content})

#---------------------DELETE------------------#

@app.get('/books/delete/<int:id>')
@auth_required("token")
@roles_required("admin")
def delete_book(id):
    book = Book.query.get(id)  
    issue=Issue.query.filter_by(book_id=id).first()
    purchases=Purchase.query.filter_by(book_id=id).all()
    ratings=Rating.query.filter_by(book_id=id).all()

    if not book:
        return jsonify({"message": "Book not found"}), 404
    
    db.session.delete(book)
    if issue:
        db.session.delete(issue)
    for purchase in purchases:
        db.session.delete(purchase)
    for rating in ratings:
        db.session.delete(rating)
    db.session.commit()
    return jsonify({"message": "Book deleted successfully"})

section_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "books": fields.List(fields.Nested(book_fields))
}

@app.get('/sections')
@auth_required("token")
def get_sections():
    sections = Section.query.all()
    if len(sections) == 0:
        return jsonify({"message": "No sections available"}), 404
    return marshal(sections, section_fields)
    