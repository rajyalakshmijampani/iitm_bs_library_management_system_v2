from flask import current_app as app,jsonify,request,render_template
from flask_security import auth_required, roles_required, current_user
from flask_restful import marshal,fields
from .models import Request,db,Book,Issue,Purchase,Rating
from .datastore import datastore
from werkzeug.security import check_password_hash

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

book_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "author": fields.String
}

@app.get('/books')
@auth_required("token")
def get_books():
    books = Book.query.all()
    if len(books) == 0:
        return jsonify({"message": "No books available"}), 404
    return marshal(books, book_fields)

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
    