from flask import current_app as app,jsonify,request,render_template,Response
from flask_security import auth_required, roles_required,current_user
from flask_restful import marshal,fields
from .models import Request,db,User,Book,Section,Issue,Purchase,Rating,book_section
from .datastore import datastore
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime,timedelta
from io import BytesIO
from sqlalchemy import and_


@app.get('/')
def home():
    return render_template("index.html")

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "name": fields.String
    }

@app.post('/user_login')
def user_login():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body required"}),400

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
        marshalled_data = marshal(user, user_fields)
        return jsonify({**marshalled_data, **{"role":user.roles[0].name,"token":user.get_auth_token()}})
    else:
        return jsonify({"message":"Incorrect password"}),400

@app.post('/register')
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body required"}),400

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

@app.post('/updateProfile/<int:id>')
@auth_required("token")
def update_profile(id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body required"}),400

    name=data.get('name')
    email = data.get('email')
    if not name:
        return jsonify({"message":"Name is required"}),400
    if not email:
        return jsonify({"message":"Email is required"}),400
    other_user = User.query.filter(and_(User.email == email, User.id != id)).first()
    if other_user:
        return jsonify({"message":"Email already exists"}),404
    user = datastore.find_user(id=id)
    if not user:
        return jsonify({"message":"User does not exist"}),400
    user.name = name
    user.email = email
    db.session.commit()
    return jsonify({"message":"Profile Updated successfully"})

@app.post('/changePwd/<int:id>')
@auth_required("token")
def change_password(id):
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body required"}),400

    oldpwd=data.get('oldpwd')
    newpwd = data.get('newpwd')
    if not oldpwd:
        return jsonify({"message":"Old Password is required"}),400
    if not newpwd:
        return jsonify({"message":"New Password is required"}),400
    user = datastore.find_user(id=id)
    if check_password_hash(user.password,oldpwd):
        user.password = generate_password_hash(newpwd)
        db.session.commit()
        return jsonify({"message":"Password updated successfully"})
    else:
        return jsonify({"message":"Incorrect old password"}),400


#===============================BOOK API===============================#

class IssuedTo(fields.Raw):
    def format(self, id):
        issue = Issue.query.filter_by(book_id=id,is_active=True).first()
        return {'id':issue.user.id,'name':issue.user.name} if issue else None

class RequestedBy(fields.Raw):
    def format(self, id):
        request_record = Request.query.filter_by(book_id=id,status='PENDING').first()
        return {'id':request_record.user.id,'name':request_record.user.name} if request_record else None
    
book_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "author": fields.String,
    "price": fields.Integer,
    "sections": fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String
        })),
    "content": fields.String,
    "average_rating": fields.Float,
    "issued_to" : IssuedTo(attribute='id'),
    "requested_by" : RequestedBy(attribute='id')
    }

#---------------------CREATE------------------#

@app.post('/book/create')
@auth_required("token")
@roles_required("admin")
def create_book():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body required"}),400

    name=data.get('name')
    author=data.get('author')
    sections=data.get('sections')
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
    if sections:
        for sec in sections:
            section_obj=Section.query.get(sec)
            if not section_obj:
                return jsonify({"message":"Invalid value(s) in section list"}),400

    book = Book.query.filter_by(name=name).first()
    if book:
        return jsonify({"message":"Book name already exists"}),404
    book = Book(name=name,author=author,price=price,content=content,create_date=datetime.now())
    for sec in sections:
        book.sections.append(Section.query.get(sec))
    db.session.add(book)
    db.session.commit()
    marshalled_data = marshal(book, book_fields)
    return jsonify({**marshalled_data, **{"message":"Book created successfully"}})

#---------------------READ------------------#

@app.get('/book/all')
@auth_required("token")
def get_books():
    books = Book.query.all()
    if not books:
        return jsonify({"message": "No books available"}), 404
    return marshal(books, book_fields)

@app.get('/book/<int:id>')
@auth_required("token")
def get_book_by_id(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    return marshal(book, book_fields)


@app.get('/book/download/<int:id>')
@auth_required("token")
def download_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    else:
        return jsonify({"content":book.content})
    
#---------------------UPDATE------------------#

@app.post('/book/update')
@auth_required("token")
@roles_required("admin")
def update_book():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body required"}),400

    id = data.get('id')
    name=data.get('name')
    author=data.get('author')
    sections=data.get('sections')
    price=data.get('price')
    content=data.get('content')
    if not id:
        return jsonify({"message":"Book ID is required"}),400
    else:
        book = Book.query.get(id)
        if not book:
            return jsonify({"message":"Invalid Book ID"}),400
    if name:
        book.name = name
    if author:
        book.author=author
    if content :
        book.content = content
    if price:
        try:
            price=int(price)
            book.price = price
        except:
            return jsonify({"message":"Invalid value for price"}),400
    db.session.execute(book_section.delete().where(book_section.c.book_id == id))
    if sections:
        for sec in sections:
            section_obj=Section.query.get(sec)
            if not section_obj:
                return jsonify({"message":"Invalid value(s) in section list"}),400
            book.sections.append(Section.query.get(sec))

    db.session.commit()
    marshalled_data = marshal(book, book_fields)
    return jsonify({**marshalled_data, **{"message":"Book updated successfully"}})


#---------------------DELETE------------------#

@app.get('/book/delete/<int:id>')
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


#===============================SECTION API===============================#

section_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "books": fields.List(fields.Nested(book_fields))
}

@app.get('/section/all')
@auth_required("token")
def get_sections():
    sections = Section.query.all()
    if len(sections) == 0:
        return jsonify({"message": "No sections available"}), 404
    return marshal(sections, section_fields)

#---------------------------------------USER RELATED--------------------------#

@app.get('/userbook/<int:id>')
@auth_required("token")
@roles_required("user")
def get_userbook_by_id(id):
    user_id = current_user.id
    user_purchased = True if (Purchase.query.filter_by(user_id = user_id,book_id =id).first()) else False

    rating_record = Rating.query.filter_by(user_id = user_id,book_id =id).first()
    user_rating = rating_record.rating if rating_record else 0

    request_record = Request.query.filter_by(user_id = user_id,book_id =id).first()
    user_request_status=request_record.status if request_record else None

    return jsonify({"user_purchased": user_purchased,"user_rating":user_rating,"user_request_status":user_request_status})

@app.post('/user')
@auth_required("token")
@roles_required("user")
def user():
    data = request.get_json()
    action = data.get('action')

    if not data:
        return jsonify({"message": "Request body required"}),400
    if not action:
        return jsonify({"message": "Action required"}), 400
    
    user_id = current_user.id
    book_id = data.get('book_id')
    if not book_id:
            return jsonify({"message": "Book id required"}), 400
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Invalid Book ID"}), 400
    
    if action=='RATE':
        rating = data.get('rating')

        if not rating:
            return jsonify({"message": "Rating required"}), 400
        try:
            rating=int(rating)
        except:
            return jsonify({"message": "Invalid rating format. Choose a number between 1 and 5"}), 400
        if (rating<1 or rating>5):
            return jsonify({"message": "Choose a rating between 1 and 5"}), 400
        
        prev_rating_record = Rating.query.filter_by(user_id=user_id,book_id=book_id).first()
        if prev_rating_record:
            prev_rating_record.rating = rating
        else:
            rating = Rating(user_id=user_id,book_id=book_id,rating=rating)
            db.session.add(rating)
        db.session.commit()
        return jsonify({'message': 'Rating submitted successfully'})

    elif action=='REQUEST':
        
        is_issued = Issue.query.filter_by(book_id=book_id,is_active=True).first()
        if (is_issued):
            return jsonify({"message": "Book already issued to a user. Cannot be requested"}), 400
        is_requested = Request.query.filter_by(book_id=book_id,status='PENDING').first()
        if (is_requested):
            return jsonify({"message": "Book already requested by a user. Cannot place a new request"}), 400
        # Books count for user
        issued_books = Issue.query.filter_by(book_id=book_id,user_id=user_id,is_active=True).count()
        requested_books = Request.query.filter_by(book_id=book_id,user_id=user_id,status='PENDING').count()

        if (issued_books+requested_books) >=5:
            return jsonify({"message": "User already has max allowed count of issues+requests. Cannot place a new request"}), 400
        
        request_record = Request(book_id=book_id,user_id=user_id)
        db.session.add(request_record)
        db.session.commit()
        return jsonify({'message': 'Book requested successfully'})

    elif action=='CANCEL':

        requested = Request.query.filter_by(book_id=book_id,user_id=user_id,status='PENDING').first()
        if not requested:
            return jsonify({"message": "No pending request for the book by the user"}), 400
        
        requested.status='CANCELLED'
        db.session.commit()
        return jsonify({'message': 'Request cancelled successfully'})
    
    elif action=='RETURN':
        issue = Issue.query.filter_by(book_id=book_id,user_id=user_id,is_active=True).first()
        if not issue:
            return jsonify({"message": "Book not issued to the user"}), 400
        else:
            issue.is_active=False
            issue.return_date = datetime.now()
            book.is_issued = False
            db.session.commit()
            return jsonify({'message': 'Book returned successfully'})
    
    elif action=='PURCHASE':
        is_purchased = Purchase.query.filter_by(book_id=book_id,user_id=user_id).first()
        if is_purchased:
            return jsonify({"message": "Book already purchased by the user"}), 400
        else:
            purchase = Purchase(book_id=book_id,user_id=user_id)
            db.session.add(purchase)
            db.session.commit()
            return jsonify({'message': 'Book purchased successfully.'})
    
    else:
        return jsonify({"message": "Invalid action."}), 400

    

#---------------------------------------ADMIN RELATED--------------------------#

@app.post('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    data = request.get_json()
    action = data.get('action')

    if not data:
        return jsonify({"message": "Request body required"}), 400
    if not action:
        return jsonify({"message": "Action required"}), 400
    
    book_id = data.get('book_id')
    if not book_id:
        return jsonify({"message": "Book id required"}), 400
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Invalid Book ID"}), 400
    
    if action=='APPROVE':
        request_record = Request.query.filter_by(book_id=book_id,status='PENDING').first()
        if not request_record:
            return jsonify({"message": "No pending requests for this book"}), 400
        else:
            request_record.status='APPROVED'
            issue = Issue(book_id=book_id,
                        user_id=request_record.user_id,
                        issue_date=datetime.now(),
                        is_active=True)
            db.session.add(issue)
            book.is_issued = True
            db.session.commit()
            return jsonify({'message': 'Request approved successfully'})
    
    elif action=='REJECT':
        request_record = Request.query.filter_by(book_id=book_id,status='PENDING').first()
        if not request_record:
            return jsonify({"message": "No pending requests for this book"}), 400
        else:
            request_record.status='REJECTED'
            db.session.commit()
            return jsonify({'message': 'Request rejected successfully'})
    
    # elif action=='ISSUE':

    #     is_issued = Issue.query.filter_by(book_id=book_id,is_active=True).first()
    #     if (is_issued):
    #         return jsonify({"message": "Book already issued to a user"}), 400
    #     is_requested = Request.query.filter_by(book_id=book_id,status='PENDING').first()
    #     if (is_requested):
    #         return jsonify({"message": "Book already requested by a user. Cannot place a new request"}), 400
    #     else:
    #         request.status='APPROVED'
    #         issue = Issue(book_id=book_id,
    #                     user_id=request.user_id,
    #                     issue_date=datetime.now(),
    #                     return_date=datetime.now()+timedelta(days=app.config['MAX_DAYS_OF_ISSUE']),
    #                     is_active=True)
    #         db.session.add(issue)
    #         book.is_issued = True
    #         db.session.commit()
    #         return jsonify({'message': 'Request approved successfully'})
    
    elif action=='REVOKE':
        issue = Issue.query.filter_by(book_id=book_id,is_active=True).first()
        if not issue:
            return jsonify({"message": "Book not issued to any user"}), 400
        else:
            issue.is_active=False
            issue.return_date = datetime.now()
            book.is_issued = False
            db.session.commit()
            return jsonify({'message': 'Book revoked successfully'})

    else:
        return jsonify({"message": "Invalid action."}), 400
    