from flask import current_app as app,jsonify,request,render_template
from flask_security import auth_required, roles_required
from flask_restful import marshal,fields
from .models import Request,db,Book
from .datastore import datastore
from werkzeug.security import check_password_hash

@app.get('/')
def home():
    return render_template("index.html")

# @app.get("/approve/<int:req_id>")
# @auth_required("token")
# @roles_required("admin")
# def approve(req_id):
#     req = Request.query.get(id=req_id)
#     if not req:
#         return jsonify({"message":"Request not found"}),404
#     else:
#         req.status = "APPROVED"
#         db.session.commit()
#         return jsonify({"message":"Request Approved"}),404

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
@roles_required("admin")
def get_books():
    books = Book.query.all()
    if len(books) == 0:
        return jsonify({"message": "No books Found"}), 404
    return marshal(books, book_fields)
    