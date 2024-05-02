from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    username=db.Column(db.String,primary_key=True)
    password=db.Column(db.String)
    name=db.Column(db.String)
    email=db.Column(db.String,unique=True)
    fs_uniquifier = db.Column(db.String(255),unique=True,nullable=False)
    role_id = db.Colum(db.String,db.ForeignKey('role.id'))
    role = db.relationship('Role')

class Role(db.Model):
    id = db.Column(db.String,primary_key=True)
    name = db.Column(db.String,unique=True)
    description = db.Column(db.String(255))

class Book(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String,unique=True)
    file_name=db.Column(db.String)
    author=db.Column(db.String)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'))
    is_issued = db.Column(db.Boolean, default = False)    
    create_date=db.Column(db.DateTime)
    section = db.relationship('Section')

class Section(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String,unique=True)
    description=db.Column(db.String(255))

class Issue(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    username=db.Column(db.String,db.ForeignKey('user.username'))
    issue_date=db.Column(db.DateTime)
    return_date=db.Column(db.DateTime)

class Purchase(db.Model):
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    username=db.Column(db.String,db.ForeignKey('user.username'))

    __table_args__ = (
        db.PrimaryKeyConstraint('book_id', 'username'),
    )

class Rating(db.Model):
    username=db.Column(db.String,db.ForeignKey('user.username'))
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    rating = db.Column(db.Integer)

    __table_args__ = (
        db.PrimaryKeyConstraint('username', 'book_id'),
    )

class Request(db.Model):
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    username=db.Column(db.String,db.ForeignKey('user.username'))

    __table_args__ = (
        db.PrimaryKeyConstraint('book_id', 'username'),
    )