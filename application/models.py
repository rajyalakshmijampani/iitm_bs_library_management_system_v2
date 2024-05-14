from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from sqlalchemy.sql import func
from pytz import timezone

db = SQLAlchemy()

class User(db.Model,UserMixin):
    id=db.Column(db.Integer(),primary_key=True)
    email=db.Column(db.String,unique=True)
    password=db.Column(db.String)
    name=db.Column(db.String)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(255),unique=True,nullable=False)
    roles = db.relationship('Role',secondary='roles_users',
                            backref = db.backref('user',lazy='dynamic'))

class Role(db.Model,RoleMixin):
    id = db.Column(db.Integer(),primary_key=True)
    name = db.Column(db.String,unique=True)
    description = db.Column(db.String(255))

class RolesUsers(db.Model):
    id = db.Column(db.Integer(),primary_key=True)
    user_id = db.Column('user_id',db.Integer(),db.ForeignKey('user.id'))
    role_id = db.Column('role_id',db.Integer(),db.ForeignKey('role.id'))

class Book(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String,unique=True)
    content=db.Column(db.String)
    author=db.Column(db.String)
    price=db.Column(db.Integer)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'))
    is_issued = db.Column(db.Boolean, default = False)    
    create_date=db.Column(db.DateTime)
    section = db.relationship("Section", back_populates="books")   
    ratings = db.relationship('Rating', backref='book', lazy='dynamic')

    @property
    def average_rating(self):
        return self.ratings.with_entities(db.func.avg(Rating.rating)).scalar() 

class Section(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String,unique=True)
    description=db.Column(db.String(255))
    books = db.relationship("Book", back_populates="section")

class Issue(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.String,db.ForeignKey('user.id'))
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))    
    issue_date=db.Column(db.DateTime)
    return_date=db.Column(db.DateTime)

class Purchase(db.Model):
    user_id=db.Column(db.String,db.ForeignKey('user.id'))
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    
    __table_args__ = (
        db.PrimaryKeyConstraint('user_id','book_id'),
    )

class Rating(db.Model):
    user_id=db.Column(db.String,db.ForeignKey('user.id'))
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    rating = db.Column(db.Integer)

    __table_args__ = (
        db.PrimaryKeyConstraint('user_id', 'book_id'),
    )

@db.event.listens_for(Rating, 'after_insert')
def update_average_rating(mapper, connection, target):
    book = target.book
    if book:
        book.average_rating = book.average_rating

class Request(db.Model):
    user_id=db.Column(db.String,db.ForeignKey('user.id'))
    book_id=db.Column(db.Integer,db.ForeignKey('book.id'))
    status=db.Column(db.String,default='PENDING')  # APPROVED/PENDING/REJECTED

    __table_args__ = (
        db.PrimaryKeyConstraint('user_id', 'book_id'),
    )

